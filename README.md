# cSelect
A pure JavaScript plug-in that allows you to transform a regular select element into a div-based element that you can style as desired.
The new select will inherit any properties that are included on the original select like: disabled, selected, values and text.
It also updates the old select with the newly selected option so the request is made with the proper values.
-------
The plug-in has been created using latest ES6 features, so my intention was not full browser support (sorry IE8, but you are dead).
The added css file is there only as a starting point, but feel free to change or replace it as needed, but some properties are necessary for the plugin to work correctly.

## Setup
1. Include cselect.css file in head of project;
2. Include cselect.js file in project and import module in your main script;
3. Set options if you dont like animated dropdown or search:
```
  const cSelectSettings = {
    animated: false,
    search: false
  }
```
4. Get the select element you want to transform. There are two ways to initialze CSelect:
  ### If you need only a single instance:
  You can perform a single querySelector or simply provide the class name of your select element (including the dot/hashtag at the beginning)
```
  const select = document.querySelector('.custom-select-class');
```
  or
```
  const select = '.custom-select-class';
```
 and then initialize the CSelect constructor:
```
  const cSelect = new CSelect(select, cSelectSettings);
```
  ### If you need to customize multiple select elements:
  You can query a collection of the necessary nodes:
```
  const select = document.querySelectorAll('.custom-select-class');
```
  And then loop through the collection to initialize standalone instances of CSelect. We are using 'Array.from()' because the initial result is a collection of nodes and we need to convert it to an array:
```
  const cSelect = Array.from(select).map(item => {
    return new CSelect(item);
  });
```

## Settings
In the current version, the behaviour of the CSelect plugin is quite limited and you could modify the following optional properties:

Option | Type | Default | Description
------ | ---- | ------- | -----------
animated | boolean | true | Toggles expanding dropdown and search items with animation
search | boolean | true | Allows searching available options (including disabled ones)
------

## Methods
Methods can be called on CSelect instances.

For example, in some situations, it is necessary to make dynamic changes to the original select (add/remove options). After those changes you would need to call the inherited 'update' method of your particular instance and it will automatically do the rest of the job for you:

```
  YourCSelectObject.prototype.update();
```

Method | Argument | Description
------ | ---- | ------------------
update | none | Automatically collects the changed original select element and updates the state of CSelect
------

## To-do sometime in the undefined future
1. Add multiselect options features

------
#### Example
Check out this working version of the plug-in:
[https://codepen.io/Vigorski/pen/gORLxPg](https://codepen.io/Vigorski/pen/gORLxPg)

Copyright (c) 2021 Igor Veleski