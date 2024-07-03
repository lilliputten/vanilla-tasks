// @ts-check

import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';
import { MainMenuClass } from './MainMenuClass/MainMenuClass.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {ProjectsListClass} */
  processList;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // const { callbacks } = this;

    // Processes list component
    this.mainMenu = new MainMenuClass(sharedParams);

    // Processes list component
    this.processList = new ProjectsListClass(sharedParams);
  }
}
