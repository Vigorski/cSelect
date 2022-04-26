// KEYCODES FOR KEYBOARD CHARACTERS
const KEY_TAB = 'Tab';
const KEY_SHIFT_LEFT = 'ShiftLeft';
const KEY_SHIFT_RIGHT = 'ShiftRight';
const KEY_SPACE = 'Space';
const KEY_ENTER = 'Enter';
const KEY_UP = 'ArrowUp';
const KEY_DOWN = 'ArrowDown';
const KEY_ESC = 'Escape';

// ALIAS FOR DROPDOWN ACTIONS
const DROP_OPEN = 'add';
const DROP_CLOSE = 'remove';
const DROP_TOGGLE = 'toggle';

// OPERANDS FOR SEARCHING FOR AVAILABLE OPTIONS
const OPERAND_ADD = 'add';
const OPERAND_SUBTRACT = 'subtract';

export default class CSelect {
	constructor(select, settings) {
		this.animated = settings?.animated ?? true;
		this.search = settings?.search ?? true;
		this.select = this.isElement(select) ? select : document.querySelector(select);
		this.selectIsDisabled = this.select.disabled ? true : false;
		this.options = this.getFormattedOptions(this.select.children);
		this.cSelect = document.createElement('div');
		this.cSelectSingle = document.createElement('div');
		this.cSelectDrop = document.createElement('div');
		this.cSelectSearchInput = this.search ? document.createElement('input') : null;
		this.cSelectResults = document.createElement('ul');

		this.init();
		// Dont add events and focus if select is disabled
		if (!this.selectIsDisabled) {
			this.addEvents();
			this.setFocusOnElements(this);
		}
	}

	get selectedOption() {
		return this.options.find((option) => option.selected);
	}

	get selectedOptionIndex() {
		return this.options.indexOf(this.selectedOption);
	}

	init() {
		const cSelectLabel = document.createElement('span');
		const cSelectLabelArrow = document.createElement('div');

		// Add classes and text
		this.cSelectSingle.classList.add('cSelect__default');
		this.cSelect.classList.add('cSelect');
		this.cSelectResults.classList.add('cSelect__results');
		this.cSelectDrop.classList.add('cSelect__drop');
		cSelectLabelArrow.classList.add('cSelect__label-arrow');
		cSelectLabel.classList.add('cSelect__label');
		cSelectLabel.innerText = this.selectedOption.label;

		// Append children label, arrow + options
		this.initOptions();
		this.cSelectSingle.appendChild(cSelectLabel);
		this.cSelectSingle.appendChild(cSelectLabelArrow);
		this.cSelect.appendChild(this.cSelectSingle);
		if (this.search) {
			this.initSearch();
		}
		this.cSelectDrop.appendChild(this.cSelectResults);
		this.cSelect.appendChild(this.cSelectDrop);
		this.select.after(this.cSelect);
		if (this.select.disabled) {
			this.cSelect.classList.add('cSelect__disabled');
		}
		this.select.style.display = 'none';
	}

	initSearch() {
		const cSelectSearch = document.createElement('div');
		const cSelectSearchIcon = document.createElement('div');

		// Add classes
		cSelectSearch.classList.add('cSelect__search');
		this.cSelectSearchInput.classList.add('cSelect__search-input');
		cSelectSearchIcon.classList.add('cSelect__search-icon');
		this.animated && cSelectSearch.classList.add('cSelect__search--animated');
		this.cSelectSearchInput.tabIndex = 0;

		// Append children
		cSelectSearch.appendChild(this.cSelectSearchInput);
		cSelectSearch.appendChild(cSelectSearchIcon);
		this.cSelectDrop.appendChild(cSelectSearch);
	}

	initOptions(options = this.options) {
		// Dont add options if select is disabled
		if (this.selectIsDisabled) return;

		// bind this to object due to event listener
		const _this = this;

		options.forEach((item) => {
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

	destroyOptions() {
		while (this.cSelectResults.firstChild) {
			this.cSelectResults.removeChild(this.cSelectResults.lastChild);
		}
	}

	getFormattedOptions(options = this.options) {
		return Array.from(options).map((optionEle) => ({
			value: optionEle.value ?? '',
			label: optionEle.label ?? '',
			selected: optionEle.selected ?? false,
			disabled: optionEle.disabled ?? false,
			hidden: false,
			element: optionEle ?? null,
		}));
	}

	addEvents() {
		this.cSelectSingle.addEventListener('click', () => {
			this.toggleDropdown(DROP_TOGGLE);
			this.search && this.clearSearchQuery();
		});

		this.cSelect.addEventListener('blur', () => {
			setTimeout(() => {
				if (document.activeElement !== this.cSelectSearchInput) {
					this.toggleDropdown(DROP_CLOSE);
					this.search && this.clearSearchQuery();
				}
			}, 0);
		});

		this.search &&
			this.cSelectSearchInput.addEventListener('blur', () => {
				setTimeout(() => {
					if (document.activeElement !== this.cSelect) {
						this.toggleDropdown(DROP_CLOSE);
						this.clearSearchQuery();
					}
				}, 0);
			});

		this.cSelect.addEventListener('keyup', (e) => {
			switch (e.code) {
				case KEY_UP:
					const prevOption = this.getAvailableOption(OPERAND_SUBTRACT);
					prevOption && this.selectValue(prevOption);
					this.toggleDropdown(DROP_OPEN);
					break;
				case KEY_DOWN:
					const nextOption = this.getAvailableOption(OPERAND_ADD);
					nextOption && this.selectValue(nextOption);
					this.toggleDropdown(DROP_OPEN);
					break;
				case KEY_SPACE:
					if (document.activeElement === this.cSelectSearchInput) break;
					this.toggleDropdown(DROP_TOGGLE);
					break;
				case KEY_ENTER:
				case KEY_ESC:
					this.toggleDropdown(DROP_CLOSE);
					break;
				case KEY_TAB:
				case KEY_SHIFT_LEFT:
				case KEY_SHIFT_RIGHT:
					break;
				default:
					this.searchQuery(this.cSelectSearchInput);
					break;
			}
		});

		// using keydown here to stop form from making request
		this.search &&
			this.cSelectSearchInput.addEventListener('keydown', (e) => {
				switch (e.code) {
					case KEY_ENTER:
						e.preventDefault();
						this.clearSearchQuery();
						break;
					default:
						break;
				}
			});
	}

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
		// .scrollHeight gets actual height of container, even if hidden
		const isOpen = this.cSelectDrop.classList.contains('cSelect__drop--open');
		const animatedDropHeight = this.animated ? `${this.cSelectResults.scrollHeight}px` : 'auto';
		this.cSelectDrop.classList[type]('cSelect__drop--open');

		switch (type) {
			case DROP_TOGGLE:
				this.cSelectDrop.style.height = isOpen ? 0 : animatedDropHeight;
				this.search && !isOpen && this.cSelectSearchInput.focus();
				if (this.search) this.cSelectSearchInput.tabIndex = isOpen ? -1 : 0;
				break;
			case DROP_CLOSE:
				if (!isOpen) break;
				this.cSelectDrop.style.height = 0;
				if (this.search) this.cSelectSearchInput.tabIndex = -1;
				break;
			case DROP_OPEN:
				if (isOpen) break;
				this.cSelectDrop.style.height = animatedDropHeight;
				if (this.search) this.cSelectSearchInput.tabIndex = 0;
				break;
			default:
				break;
		}
	}

	getAvailableOption(operand) {
		const currentIndex = this.selectedOptionIndex;
		let availableIndex = null;

		// this does not loop through the whole list
		// rather the list is being used as a finite max number necessary for changing between options
		// it will only iterate until reaching an eligible option
		// and apparently its bad practice to use while(true){} :)
		for (let i = 1; i < this.options.length; i++) {
			if (operand === OPERAND_ADD) availableIndex = this.options[currentIndex + i];
			if (operand === OPERAND_SUBTRACT) availableIndex = this.options[currentIndex - i];
			if (availableIndex?.disabled || availableIndex?.hidden) continue;
			// returns undefined if nothing found
			return availableIndex;
		}
	}

	searchQuery(searchInput) {
		const formatedInputText = searchInput.value.toLowerCase();
		const results = this.options.filter((item) => {
			const formatedOptionText = item.label.toLowerCase();
			// check if exists
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

		this.hideResults();
		this.showResults(results);
	}

	clearSearchQuery() {
		const searchInput = this.cSelectSearchInput;

		if (this.search && searchInput.value.length > 0) {
			searchInput.value = '';
			this.searchQuery(searchInput);
		}
	}

	showResults(results) {
		for (let option of results) {
			option.hidden = false;
		}

		this.initOptions(results);
	}

	hideResults() {
		for (let option of this.options) {
			option.hidden = true;
		}

		this.destroyOptions();
	}

	update() {
		this.options = this.getFormattedOptions(this.select.children);
		this.destroyOptions();
		this.initOptions();
	}

	isObject(obj) {
		return obj === Object(obj);
	}

	isElement(ele) {
		if (!ele) {
			return false;
		}

		if (
			ele instanceof Node ||
			ele instanceof NodeList ||
			ele instanceof HTMLCollection
		) {
			return true;
		}

		if (this.isObject(document) && ele === document) {
			return true;
		}
	}

	setFocusOnElements() {
		// make select focusable, but not dropdown
		this.cSelect.tabIndex = 0;
		this.cSelectDrop.tabIndex = -1;
		this.cSelectResults.tabIndex = -1;
		if (this.search) this.cSelectSearchInput.tabIndex = -1;
	}
}
