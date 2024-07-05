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

    /** @type {TProjectsListClassParams} */
    const params = {
      ...sharedParams,
      dataStorage: this.dataStorage,
    };

    // Main menu
    this.mainMenu = new MainMenuClass(params);

    // Processes list component
    this.processList = new ProjectsListClass(params);

    window.addEventListener('load', () => {
      this.registerSW();
    });
  }

  // Register the Service Worker
  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('serviceworker.js');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SW registration failed', error);
      }
    }
  }
}
