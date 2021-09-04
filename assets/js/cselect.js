export default class CSelect {
	constructor(select, features) {
		this.animated = features?.animated ?? true;
		this.search = features?.search ?? true;
		this.select = select;
		this.options = getFormattedOptions(select.children);
		this.cSelect = document.createElement('div');
		this.cSelectSingle = document.createElement('div');
		this.cSelectDrop = document.createElement('div');
		this.cSelectSearch = this.search ? document.createElement('div') : null;
		this.cSelectResults = document.createElement('ul');

		init(this);
		addEvents(this);

		// make select focusable, but not dropdown
		this.cSelect.tabIndex = 0;
		this.cSelectDrop.tabIndex = -1;
		this.cSelectResults.tabIndex = -1;
	}

	get selectedOption() {
		return this.options.find((option) => option.selected);
	}

	get selectedOptionIndex() {
		return this.options.indexOf(this.selectedOption);
	}

	// instance accessible method to select new value
	selectValue(newSelected) {
		const oldSelected = this.selectedOption;
		const newSelectedDOM = this.cSelectResults.querySelector(`[data-value="${newSelected.value}"]`);

		// remove selected from old
		oldSelected.element.selected = false;
		oldSelected.selected = false;
		this.cSelectResults.querySelector('.selected').classList.remove('selected');

		// add selected to new
		newSelected.element.selected = true;
		newSelected.selected = true;
		newSelectedDOM.classList.add('selected');

		// update select label and close
		this.cSelectSingle.querySelector('.cSelect__label').innerText = newSelected.label;
	}

	toggleDropdown(type) {
		const isOpen = this.cSelectDrop.classList.contains('cSelect__drop--open');
		const animatedDropHeight = this.animated ? `${this.cSelectResults.scrollHeight}px` : 'auto';
		this.cSelectDrop.classList[type]('cSelect__drop--open');

		// #TODO: fix tab focus (search remains focusable)

		switch (type) {
			case DROP_TOGGLE:
				this.cSelectDrop.style.height = isOpen ? 0 : animatedDropHeight;
				break;
			case DROP_CLOSE:
				if (!isOpen) break;
				this.cSelectDrop.style.height = 0;
				break;
			case DROP_OPEN:
				if (isOpen) break;
				this.cSelectDrop.style.height = animatedDropHeight;
				break;
			default:
				break;
		}
	}
}

// KEYCODES FOR KEYBOARD CHARACTERS
const KEY_SPACE = 32;
const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESC = 27;

// ALIAS FOR DROPDOWN ACTIONS
const DROP_OPEN = 'add';
const DROP_CLOSE = 'remove';
const DROP_TOGGLE = 'toggle';

// OPERANDS FOR SEARCHING FOR AVAILABLE OPTIONS
const OPERAND_ADD = 'add';
const OPERAND_SUBTRACT = 'subtract';

const init = (_this) => {
	const cSelectLabel = document.createElement('span');
	const cSelectLabelArrow = document.createElement('div');

	// Add classes and text
	_this.cSelectSingle.classList.add('cSelect__default');
	_this.cSelect.classList.add('cSelect');
	_this.cSelectResults.classList.add('cSelect__results');
	_this.cSelectDrop.classList.add('cSelect__drop');
	cSelectLabelArrow.classList.add('cSelect__label-arrow');
	cSelectLabel.classList.add('cSelect__label');
	cSelectLabel.innerText = _this.selectedOption.label;

	// Append children label, arrow + options
	initOptions(_this);
	_this.cSelectSingle.appendChild(cSelectLabel);
	_this.cSelectSingle.appendChild(cSelectLabelArrow);
	_this.cSelect.appendChild(_this.cSelectSingle);
	if (_this.search) initSearch(_this);
	_this.cSelectDrop.appendChild(_this.cSelectResults);
	_this.cSelect.appendChild(_this.cSelectDrop);
	_this.select.after(_this.cSelect);
	_this.select.style.display = 'none';
};

const initSearch = (_this) => {
	const cSelectSearchInput = document.createElement('input');
	const cSelectSearchIcon = document.createElement('div');

	// Add classes
	_this.cSelectSearch.classList.add('cSelect__search');
	cSelectSearchInput.classList.add('cSelect__search-input');
	cSelectSearchIcon.classList.add('cSelect__search-icon');
	cSelectSearchInput.tabIndex = 0;

	// Append children
	_this.cSelectSearch.appendChild(cSelectSearchInput);
	_this.cSelectSearch.appendChild(cSelectSearchIcon);
	_this.cSelectDrop.appendChild(_this.cSelectSearch);
};

const initOptions = (_this) => {
	_this.options.forEach((item) => {
		if (item.hidden) return;
		const option = document.createElement('li');
		option.classList.add('cSelect__option');
		option.classList.toggle('selected', item.selected);
		option.classList.toggle('disabled', item.disabled);
		option.dataset.value = item.value;
		option.innerText = item.label;
		_this.cSelectResults.appendChild(option);

		// update selected options here
		option.addEventListener('click', function () {
			// prevent selecting disabled options
			if (item.disabled) return;
			_this.selectValue(item);
			_this.toggleDropdown(DROP_CLOSE);
		});
	});
};

const getFormattedOptions = (options) => {
	return [...options].map((optionEle) => {
		return {
			value: optionEle.value,
			label: optionEle.label,
			selected: optionEle.selected,
			disabled: optionEle.disabled,
			hidden: false,
			element: optionEle,
		};
	});
};

const addEvents = (_this) => {
	const searchInput = _this.cSelectSearch.querySelector('.cSelect__search-input');

	_this.cSelectSingle.addEventListener('click', () => {
		_this.toggleDropdown(DROP_TOGGLE);
	});

	_this.cSelect.addEventListener('blur', () => {
		setTimeout(() => {
			// maybe use e.relatedTarget to avoid async
			if (document.activeElement !== searchInput) {
				_this.toggleDropdown(DROP_CLOSE);
			}
		}, 0);
	});

	searchInput.addEventListener('blur', () => {
		setTimeout(() => {
			// maybe use e.relatedTarget to avoid async
			if (document.activeElement !== _this.cSelect) {
				_this.toggleDropdown(DROP_CLOSE);
			}
		}, 0);
	});

	_this.cSelect.addEventListener('keyup', (e) => {
		switch (e.keyCode) {
			case KEY_UP:
				const prevOption = getAvailableOption(_this, OPERAND_SUBTRACT);
				prevOption && _this.selectValue(prevOption);
				_this.toggleDropdown(DROP_OPEN);
				break;
			case KEY_DOWN:
				const nextOption = getAvailableOption(_this, OPERAND_ADD);
				nextOption && _this.selectValue(nextOption);
				_this.toggleDropdown(DROP_OPEN);
				break;
			case KEY_SPACE:
				if (document.activeElement === searchInput) break;
				_this.toggleDropdown(DROP_TOGGLE);
				break;
			case KEY_ENTER:
			case KEY_ESC:
				_this.toggleDropdown(DROP_CLOSE);
				break;
			default:
				searchQuery(_this, searchInput);
				break;
		}
	});
};

function getAvailableOption(_this, operand) {
	const currentIndex = _this.selectedOptionIndex;
	let prevIndex = null;

	for (let i = 1; i < _this.options.length; i++) {
		if (operand === OPERAND_ADD) prevIndex = _this.options[currentIndex + i];
		if (operand === OPERAND_SUBTRACT) prevIndex = _this.options[currentIndex - i];
		if (prevIndex?.disabled || prevIndex?.hidden) continue;
		return prevIndex;
	}
}

const searchQuery = (_this, searchInput) => {
	const results = [];

	const ins = _this.options[1].label.indexOf(searchInput.value);
	console.log(ins);
};
