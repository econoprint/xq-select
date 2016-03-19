xqSelect
=========

The xqSelect package is intended to make HTML5 form selects look and act the same cross browser and platform.  A jQuery plugin, CSS and Bootstrap's dropdown.js are used to style and bring additional functionality to normal select boxes.

There are a great many excellent jQuery plugins that do similar things, and credit goes to these authors for the original idea.

xqSelect is differs similar plugins in a few small ways:

* Intentionally feature sparse to reduce size and complications.  
* Under 8KB minified - 4KB if you're only using the CSS (see below).
* The original select box is still used, and is not hidden or moved of screen.

## Documentation

The documentation for xqSelect is a work in progress and will be updated as possible.  For now, please see the basic demo and usage explanation below.

## Usage and Demo

A basic demo may be seen on [BootPly](http://www.bootply.com/tl9ZiekMCQ).  A more complete demo should be available soon.

Usage is simple:
```
<div class="xq-select">
  <select id="xqSelectDemo">
    <optgroup label="Group One">
      <option value="1" data-subtext="First Thing">Item One</option>
      <option value="2">Item Two</option>
      <option value="3">Item Three</option>
      <option value="4">Item Four</option>
    </optgroup>
    <option value="5">Item Five</option>
    <option value="6">Item Six</option>
    <option value="7">Item Seven</option>
    <option value="8">Item Eight</option>
  </select>
</div>
```
This does, of course, presume that you have included the distribution JS and CSS somewhere in your HTML page.  It's recommended that stylesheet go in the ```<head>``` and the JS goes just before your closing ```</body>``` tag.

To automatically switch to a native select with *most* mobile devices, include the attribute **data-mobile="true"** in the ```<div class="xq-select">``` tag.

## Browser Compatibility

One of my biggest goals for xqSelect is cross browser compatibility.  Reports on issues with a specific browser and platform are encouraged.  See below for guidelines.  

As of this moment, it is expected that the following browsers are fully supported:

| Browser  | Version | Platform | Status
| ------------- | ------------- | ------------- | ------------- |
| Chrome  | ?* | Win/Mac/Linux | Supported |
| Firefox | ?* | Win/Mac/Linux | Supported |
| Opera | 15+ | Win/Mac/Linux | Needs Testing |
| Safari | 6.2+ | Mac | Supported |
| Safari | iOS 8/9+ | iOS | CSS Only |
| Chrome | iOS 8/9+ | iOS | CSS Only |
| Chrome | Android 5.0+ | Android | CSS Only |
| Firefox | Android 5.0+ | Android | CSS Only |
| Internet Explorer | 8 | Win | Supported |
| Internet Explorer | 9/10 | Win | Supported |
| Internet Explorer | 11 | Win | Supported |
| Edge | ?* | Win | Supported |

The following browser are still expected to work:

| Browser  | Version | Platform | Status
| ------------- | ------------- | ------------- | ------------- |
| Opera  | 11/12 | Win/Mac/Linux | Needs Testing |
| Opera | 10 | Win/Mac/Linux | Unsupported |
| Safari  | 5.1.4+ | Mac | Needs Testing |
| Safari | iOS 6.1 - 7 | iOS | Needs Testing** |
| Android Browser | Android 5.0+ | Needs Testing** |
| Opera Mini | All | All | Needs Testing** |
| Internet Explorer | All | Windows Phone | Needs Testing** |

No intention is present to support IE7, Opera 10, Safari 4, or 'ancient' versions of self-updating browsers such as Firefox and Chrome. 

For additional browser compatibility, see [jQuery Browser Support](https://jquery.com/browser-support/) and [Bootstrap Supported Browsers](http://getbootstrap.com/getting-started/#support-browsers)

\*   Need to find the lowest version xqSelect works with.

\*\*  Needs testing.  Only CSS components are expected to work.

## Bugs and feature requests

Anyone is welcome to contribute. Please read the important information below regarding opening issues!

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)

## Copyright and License

Copyright (C) 2014-2016 ExactQuery

Licensed under [the MIT license](LICENSE).
