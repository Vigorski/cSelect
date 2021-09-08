# cSelect
A pure JavaScript plug-in that allows you to transform the regular select element into a div-based element that you can style as desired.
The new select will inherit any properties that are included on the original select like: disabled, selected, values and text.
It also updates the old select with the newly selected option so the request is made with the proper values.
-------
The plug-in has been created using latest ES6 features, so my intention was not full browser support (sorry IE8, but you are dead).

### Setup
1. Include cselect.js file in project and import module in your main script;
2. Set options if you dont like animated dropdown or search:
```
  const cSelectOptions = {
    animated: false,
    search: false
  }
```
2. Get the select element you want to transform:
```
  const select = document.querySelector('.custom-select');
```
3. Initialize the CSelect class:
```
  const cSelect = new CSelect(select, cSelectOptions);
```

### Settings
In the current version, the behaviour of the custom select plugin is quite limited and you could modify the following optional properties:

Option | Type | Default | Description
------ | ---- | ------- | -----------
animated | boolean | true | Toggles expanding dropdown and search items with animation
search | boolean | true | Allows searching available options (including disabled ones)
------

#### Example
Check out this working version of the plug-in:
[https://codepen.io/Vigorski/pen/gORLxPg](https://codepen.io/Vigorski/pen/gORLxPg)

Copyright (c) 2021 Igor Veleski