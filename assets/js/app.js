import CSelect from './cselect.js';

const disabledSettings = {
  animated: false,
  search: false,
}

// Initialize CSelect with a class name as a string
// does not have animated or search turned on
const thunderstruckSelect = new CSelect('#thunderstruck', disabledSettings);

// Initialize CSelect with a class name as a collection of nodes
// has default settings
const select = document.querySelectorAll('.custom-select');
const cSelect = Array.from(select).map(item => {
  return new CSelect(item);
});


console.log(thunderstruckSelect, cSelect)