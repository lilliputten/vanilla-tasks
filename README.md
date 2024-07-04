<!--
@since 2024.06.30, 12:00
@changed 2024.07.03, 21:18
-->

# Vanilla tasks list manager

- Version: 0.0.7
- Last changes timestamp: 2024.07.04 21:11 +0500

The small application aimed to demonstrate native js and css abilities in browser environment.

## Features

- Inter-session data storing in the `localStorage`.
- Adaptive layout, adaptive main menu.
- ES6 JavaScript code.
- ES6 modules.
- Internal TypeScript support.
- Changing the order by dragging.

## Resources

The source code is located in github repository: https://github.com/lilliputten/vanilla-tasks

The actual version is deployed to:

- https://vanilla-tasks.lilliputten.com/

An extra information is available on:

- https://lilliputten.com/projects/2024/vanilla-tasks-manager

## Used technologies

This project uses only vanilla css and (almost; see below) vanilla javascript.

There used [modern es modules support](https://www.sitepoint.com/using-es-modules/) in browser. It's not a good solution from the point of view of performance, but as it's a demo application, it could be ok.

Only one 3rd-party resource was used: font-awesome icons library (v.4.5.0).

It's possible to use unicode symbols or local svg resources to completely get rid of external resources.

I've already tried using unicode icons, but they look a bit sloppy. So, I decided to leave this icons pack here.

No other libraries or dependencies are used at all.

The package.json has some dependencies, but they are only used to support the development process:

- eslint (v.8.45.0)
- prettier (v.3.0.0)
- serve (v.14.2.3)
- stylelint (v.15.10.2)
- typescript (v.5.1.6)

It's not required to install anything -- the code is already production-ready.

The code uses typescript support via jsdoc typing syntax.

Not entirely pure javascript is used here. Some exceptions include:

## TODO:

- Implement a simpler and clearer minimalistic solution that implements the basic functionality with a minimum amount of code within a single module ([issue #12](https://github.com/lilliputten/vanilla-tasks/issues/12)).
- Implement the time tracking function ([issue #13](https://github.com/lilliputten/vanilla-tasks/issues/13)).
- Add ability to sort task nodes; by drag or via dialog ([issue #8](https://github.com/lilliputten/vanilla-tasks/issues/8))
