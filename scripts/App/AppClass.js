// @ts-check

import { DataStorageClass } from './DataStorage/DataStorageClass.js';
import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';
import { MainMenuClass } from './MainMenu/MainMenuClass.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {DataStorageClass} */
  dataStorage;

  /** @type {ProjectsListClass} */
  processList;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // const { callbacks } = this;

    this.dataStorage = new DataStorageClass();

    // Processes list component
    this.mainMenu = new MainMenuClass(sharedParams);

    /** @type {TProjectsListClassParams} */
    const params = {
      ...sharedParams,
      dataStorage: this.dataStorage,
    };

    // Processes list component
    this.processList = new ProjectsListClass(params);

    // Init handler callbacks...
    // callbacks.onProjectsChanged = this.onProjectsChanged.bind(this);
    // callbacks.onProjectsChanged = this.onProjectsChanged.bind(this);
  }
}
