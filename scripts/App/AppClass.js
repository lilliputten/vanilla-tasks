// @ts-check

import * as AppConstants from './AppConstants.js';
// import { commonNotify } from '../common/CommonNotify.js';
import { SimpleEvents } from '../common/SimpleEvents.js';
import { DataStorageClass } from './DataStorage/DataStorageClass.js';
import { ActiveTasksClass } from './ActiveTasks/ActiveTasksClass.js';
import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';
import { MainMenuClass } from './MainMenu/MainMenuClass.js';
import { FirebaseClass } from './Firebase/FirebaseClass.js';
import { GoogleAuthClass } from './GoogleAuth/GoogleAuthClass.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {SimpleEvents} */
  appEvents;

  /** @type {DataStorageClass} */
  dataStorage;

  /** Authorization
   * @type {GoogleAuthClass}
   */
  googleAuth;

  /** Main menu
   * @type {MainMenuClass}
   */
  mainMenu;

  /** Firebase
   * @type {FirebaseClass}
   */
  firebase;

  /** @type {ActiveTasksClass} */
  activeTasks;

  /** @type {ProjectsListClass} */
  processList;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // const { callbacks } = this;

    const appEvents = (this.appEvents = new SimpleEvents('App'));

    /** @type {Partial<TModules>} */
    const modules = {};

    /** @type {TCoreParams} */
    const coreParams = {
      ...sharedParams,
      appEvents,
      modules: /** @type {TModules} */ (modules),
    };
    const dataStorage = (this.dataStorage = new DataStorageClass(coreParams));

    const activeTasks = (this.activeTasks = new ActiveTasksClass(coreParams));

    this.initActiveProjects();

    // Auth...
    this.googleAuth = new GoogleAuthClass(coreParams);

    // Main menu
    this.mainMenu = new MainMenuClass(coreParams);

    // Firebase
    this.firebase = new FirebaseClass(coreParams);

    // Processes list component
    this.processList = new ProjectsListClass(coreParams);

    /* NOTE: SW temporaqrily disabled (for the demo time)
     * window.addEventListener('load', () => {
     *   this.registerSW();
     * });
     */

    /* // DEBUG: Check initialized modules
     * console.log('[AppClass] initialization finished', {
     *   modules,
     * });
     */
    appEvents.emit('AppInited', coreParams);
  }

  initActiveProjects() {
    const { dataStorage, activeTasks } = this;
    const { projects } = dataStorage;
    /** @type {TActiveTask[]} */
    const activeTasksList = [];
    // Try to find all the active tasks...
    projects.forEach(({ id: projectId, tasks }) => {
      tasks.forEach((task) => {
        const { id: taskId, status } = task;
        if (status === 'active') {
          /** @type {TActiveTask} */
          const activeTask = {
            projectId,
            taskId,
            task,
          };
          activeTasksList.push(activeTask);
        }
      });
    });
    return activeTasks.initTasks(activeTasksList);
  }

  // Register the Service Worker
  async registerSW() {
    if (!AppConstants.isLocal && 'serviceWorker' in navigator) {
      // commonNotify.showSuccess('start serviceworker');
      try {
        await navigator.serviceWorker.register('serviceworker.js');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SW registration failed', error);
      }
    }
  }
}
