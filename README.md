<!--
@since 2024.06.30, 12:00
@changed 2024.07.25, 19:09
-->

# Vanilla Tasks Tracker

- Version: 0.0.13
- Last changes timestamp: 2024.07.25 15:40 +0000

The small application aimed to demonstrate native js and css abilities in browser environment.

## Features

- Inter-session data storing: using the `localStorage` and firebase cloud database (for authorized users, see below).
- User authorization (using Google OAUTH).
- Caching service worker with abilities to automatically flush the cache on version change and installation of the PWA application.
- Time tracking functionality (even when the apllication is not active).
- Adaptive layout, adaptive main menu.
- Data import/export from/to a local json file.
- Minimal UI: Popup dialogs, toasts.
- Change the order of the project/task items by drag-and-drop (with support for mobile devices).
- ES6 JavaScript code.
- ES6 browser modules.
- Internal TypeScript support (via jsdoc tags).


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
