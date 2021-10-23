import CSelect from './cselect.js';
import addSelectOptions from './addSelectOptions.js';

const disabledSettings = {
  animated: false,
  search: false,
}

// Initialize CSelect with a class name as a collection of nodes
// does not have animated or search turned on
const select = Array.from(document.querySelectorAll('.custom-select'));
const cSelect = select.map(item => {
  return new CSelect(item, disabledSettings);
});

// Initialize CSelect with a class name as a string
// has default settings
const thunderstruckCSelect = new CSelect('#thunderstruck');

// After changing original select,
// we also have to update CSelect's instance manually
// in order to avoid more listeners or observers
const asyncBtn = document.querySelector('#updateSelect');
asyncBtn.addEventListener('click', async () => {
    await addSelectOptions();
    thunderstruckCSelect.update();
});


////////////////////////////////////////////////////////////////////////
console.log(cSelect, thunderstruckCSelect)