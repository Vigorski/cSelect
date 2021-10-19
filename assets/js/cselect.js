// KEYCODES FOR KEYBOARD CHARACTERS
const KEY_TAB = 9;
const KEY_SHIFT = 16;
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

export default class CSelect {
	constructor(select, features) {
		this.animated = features?.animated ?? true;
		this.search = features?.search ?? true;
		this.select = isElement(select) ? select : document.querySelector(select);
		this.selectIsDisabled = this.select.disabled ? true : false;
		this.options = getFormattedOptions(this.select.children);
		this.cSelect = document.createElement('div');
		this.cSelectSingle = document.createElement('div');
		this.cSelectDrop = document.createElement('div');
		this.cSelectSearch = this.search ? document.createElement('div') : null;
		this.cSelectSearchInput = this.search ? document.createElement('input') : null;
		this.cSelectResults = document.createElement('ul');

		init(this);
		// Dont add events and focus if select is disabled
		if (!this.selectIsDisabled) {
			addEvents(this);
			setFocusOnElements(this);
		}
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
		this.cSelectResults.querySelector('.selected')?.classList.remove('selected');

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
				this.search && !isOpen && this.cSelectSearchInput.focus();
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

function init(_this) {
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
	if (_this.search) {
		initSearch(_this);
	}
	_this.cSelectDrop.appendChild(_this.cSelectResults);
	_this.cSelect.appendChild(_this.cSelectDrop);
	_this.select.after(_this.cSelect);
	if(_this.select.disabled) {
		_this.cSelect.classList.add('cSelect__disabled');
	}
	_this.select.style.display = 'none';
}

function initSearch(_this) {
	const cSelectSearchIcon = document.createElement('div');

	// Add classes
	_this.cSelectSearch.classList.add('cSelect__search');
	_this.cSelectSearchInput.classList.add('cSelect__search-input');
	cSelectSearchIcon.classList.add('cSelect__search-icon');
	_this.animated && _this.cSelectSearch.classList.add('cSelect__search--animated');
	_this.cSelectSearchInput.tabIndex = 0;

	// Append children
	_this.cSelectSearch.appendChild(_this.cSelectSearchInput);
	_this.cSelectSearch.appendChild(cSelectSearchIcon);
	_this.cSelectDrop.appendChild(_this.cSelectSearch);
}

function initOptions(_this) {
	// Dont add options if select is disabled
	if (_this.selectIsDisabled) return;

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
		// using mouse down instead of click due to use of blur for closing cSelect
		option.addEventListener('mousedown', function () {
			// prevent selecting disabled options
			if (item.disabled) return;
			_this.selectValue(item);
			_this.toggleDropdown(DROP_CLOSE);
		});
	});
}

function getFormattedOptions(options) {
	return Array.from(options).map((optionEle) =>
		({
			value: optionEle.value ?? '',
			label: optionEle.label ?? '',
			selected: optionEle.selected ?? false,
			disabled: optionEle.disabled ?? false,
			hidden: false,
			element: optionEle ?? null,
		})
	);
}

function addEvents(_this) {
	_this.cSelectSingle.addEventListener('click', () => {
		_this.toggleDropdown(DROP_TOGGLE);
		_this.search && clearSearchQuery(_this);
	});

	_this.cSelect.addEventListener('blur', () => {
		setTimeout(() => {
			if (document.activeElement !== _this.cSelectSearchInput) {
				_this.toggleDropdown(DROP_CLOSE);
				_this.search && clearSearchQuery(_this);
			}
		}, 0);
	});

	_this.search &&
		_this.cSelectSearchInput.addEventListener('blur', () => {
			setTimeout(() => {
				if (document.activeElement !== _this.cSelect) {
					_this.toggleDropdown(DROP_CLOSE);
					clearSearchQuery(_this);
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
				if (document.activeElement === _this.cSelectSearchInput) break;
				_this.toggleDropdown(DROP_TOGGLE);
				break;
			case KEY_ENTER:
			case KEY_ESC:
				_this.toggleDropdown(DROP_CLOSE);
				break;
			case KEY_TAB:
			case KEY_SHIFT:
				break;
			default:
				searchQuery(_this, _this.cSelectSearchInput);
				break;
		}
	});

	_this.search &&
		_this.cSelectSearchInput.addEventListener('keydown', (e) => {
			switch (e.keyCode) {
				case KEY_ENTER:
					e.preventDefault();
					clearSearchQuery(_this);
					break;
				default:
					break;
			}
		});
}

function getAvailableOption(_this, operand) {
	const currentIndex = _this.selectedOptionIndex;
	let availableIndex = null;

	// this does not loop through the whole list
	// rather the list is being used as a finite max number necessary for changing between options
	// it will only iterate until reaching an eligible option
	// and its better than while(true){} :)
	for (let i = 1; i < _this.options.length; i++) {
		if (operand === OPERAND_ADD) availableIndex = _this.options[currentIndex + i];
		if (operand === OPERAND_SUBTRACT) availableIndex = _this.options[currentIndex - i];
		if (availableIndex?.disabled || availableIndex?.hidden) continue;
		// returns undefined if nothing found
		return availableIndex;
	}
}

function searchQuery(_this, searchInput) {
	const formatedInputText = searchInput.value.toLowerCase();
	const results = _this.options.filter((item) => {
		const formatedOptionText = item.label.toLowerCase();
		return formatedOptionText.indexOf(formatedInputText) > -1;
	});

	if (results.length === 0) {
		results.push({
			value: '',
			label: 'No results match your query',
			selected: false,
			disabled: true,
			hidden: false,
			element: null,
		});
	}

	hideResults(_this);
	showResults(_this, results);
}

function clearSearchQuery(_this) {
	const searchInput = _this.cSelectSearchInput;

	if (_this.search && searchInput.value.length > 0) {
		searchInput.value = '';
		searchQuery(_this, searchInput);
	}
}

function showResults(_this, results) {
	for (let option of results) {
		option.hidden = false;
	}

	initOptions(_this, results);
}

function hideResults(_this) {
	for (let option of _this.options) {
		option.hidden = true;
	}

	while (_this.cSelectResults.firstChild) {
		_this.cSelectResults.removeChild(_this.cSelectResults.lastChild);
	}
}


function isElement(element) {
	// which one is better?
	return typeof element === "object" && typeof element.nodeType === "number" && element.nodeType === 1;
	//return element instanceof Element || element instanceof HTMLDocument;  
}

function setFocusOnElements(_this){
	// make select focusable, but not dropdown
	_this.cSelect.tabIndex = 0;
	_this.cSelectDrop.tabIndex = -1;
	_this.cSelectResults.tabIndex = -1;
}