import CSelect from './cselect.js';

const cSelectOptions = {
  animated: true,
  search: true,
}

const select = '.custom-select';
const cSelect = new CSelect(select, cSelectOptions);

console.log(cSelect)