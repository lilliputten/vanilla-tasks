// @ts-check

import * as AppConstants from './AppConstants.js';
// import { commonNotify } from '../common/CommonNotify.js';
import { DataStorageClass } from './DataStorage/DataStorageClass.js';
import { ActiveTasksClass } from './ActiveTasks/ActiveTasksClass.js';
import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';
import { MainMenuClass } from './MainMenu/MainMenuClass.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {DataStorageClass} */
  dataStorage;

  /** @type {ActiveTasksClass} */
  activeTasks;

  /** @type {ProjectsListClass} */
  processList;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // const { callbacks } = this;

    const dataStorage = (this.dataStorage = new DataStorageClass());

    const activeTasks = (this.activeTasks = new ActiveTasksClass(sharedParams));

    this.initActiveProjects();

    /** @type {TProjectsListClassParams} */
    const params = {
      ...sharedParams,
      dataStorage,
      activeTasks,
    };

    // Main menu
    this.mainMenu = new MainMenuClass(params);

    // Processes list component
    this.processList = new ProjectsListClass(params);

    /* NOTE: SW temporaqrily disabled (for the demo time)
     * window.addEventListener('load', () => {
     *   this.registerSW();
     * });
     */
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
          /* // DEBUG!
           * task.measured = undefined;
           * task.elapsed = undefined;
           */
          activeTasksList.push(activeTask);
          // activeTasks.addTask(activeTask, { onInit: true });
        }
      });
    });
    /* console.log('[AppClass:initActiveProjects] result', {
     *   activeTasksList,
     *   projects,
     * });
     */
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
