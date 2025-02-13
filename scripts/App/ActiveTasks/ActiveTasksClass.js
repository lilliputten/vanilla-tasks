// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
// import * as CommonConstants from '../../common/CommonConstants.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

/** If detected too large diff then ask if it should be added to the elapsed accumulator for the task */
const maxNormalDiffPeriod = 30 * 60 * 1000;

const tickTimeout = 5000; // CommonConstants.isDev ? 5000 : 10000;

export class ActiveTasksClass {
  /** @type {TModules} */
  modules;

  /** @type {TCoreParams['events']} */
  events;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  layoutNode = undefined;

  /** @type {TActiveTask[]} */
  activeTasksList = [];

  /** @type {TSetTimeout} */
  tickHandler = undefined;

  /** @constructor
   * @param {TCoreParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { modules, layoutNode, events } = params;

    this.modules = modules;

    modules.activeTasks = this;

    this.events = events;

    this.layoutNode = layoutNode;

    // Init handler callbacks...
    callbacks.activeTick = this.activeTick.bind(this);
    callbacks.activeTaskTick = this.activeTaskTick.bind(this);
  }

  /** @returns {TProjectId[]} Ids of projects with active tasks */
  getActiveTaskProjects() {
    const { activeTasksList } = this;
    /** @type {TProjectId[]} */
    const activeProjectIds = [];
    activeTasksList.forEach(({ projectId }) => {
      if (!activeProjectIds.includes(projectId)) {
        activeProjectIds.push(projectId);
      }
    });
    return activeProjectIds;
  }

  /** @param {TActiveTask} activeTask */
  activeTaskTick(activeTask) {
    // const { modules } = this;
    // const { dataStorage } = modules;
    // const { projects } = dataStorage;
    // const task1 = projects[0].tasks[1];
    const { task } = activeTask;
    const { measured } = task;
    const now = Date.now();
    const diff = now - measured;
    task.elapsed += diff;
    task.measured = now;
    this.events.emit('activeTaskTick', activeTask);
  }

  /**
   * @param {TActiveTask} activeTask
   * @param {TActiveTaskStartOpts} opts
   * */
  activeTaskStart(activeTask, opts = {}) {
    const { modules } = this;
    const { dataStorage } = modules;
    const { projectId, task } = activeTask;
    const { measured } = task;
    const now = Date.now();
    // let resultPromise = Promise.resolve(undefined);
    /** @type {() => Promise} */
    let resultCb = undefined;
    if (!task.elapsed) {
      task.elapsed = 0;
    }
    if (opts.onInit /* && status === 'active' */ && measured) {
      const diff = now - measured;
      // If detected too large diff then ask if it should be added to the elapsed accumulator for the task
      const isNormal = diff <= maxNormalDiffPeriod;
      /* console.warn('[ActiveTasksClass:activeTaskStart] has measured time', {
       *   isNormal,
       *   maxNormalDiffPeriod,
       *   diff,
       *   measured,
       *   status,
       *   task,
       *   activeTask,
       * });
       */
      if (!isNormal) {
        resultCb = () => {
          const diffStr = CommonHelpers.formatDuration(diff);
          const msgText = `
          <p>An excessively long period of unaccounted time (${diffStr})
            was detected for the task "${CommonHelpers.quoteHtmlAttr(task.name)}".</p>
          <p>Probably, it was measured during a period of inactivity of the application.</p>
          <p>Do you want to add it to the elapsed time?</p>
          `;
          return AppHelpers.confirmationModal('addLastDiff', 'Add already tracked time?', msgText)
            .then(() => {
              // Add the time if the answer was 'yes'...
              task.elapsed += diff;
            })
            .catch(() => {
              /*
               * const { projects } = dataStorage;
               * const task1 = projects[0].tasks[1];
               * console.log('[ActiveTasksClass:activeTaskStart]', {
               *   activeTask,
               *   savedActiveTask,
               *   theSameActiveTask: activeTask === savedActiveTask,
               *   task,
               *   task1,
               *   'task.measured': task.measured,
               *   'task1.measured': task1.measured,
               *   isTheSame: task === task1,
               *   now,
               * });
               */
              task.measured = now;
            })
            .finally(() => {
              dataStorage.updateTask(projectId, task);
              // this.events.emit('activeTasksUpdated', this.activeTasksList);
              this.events.emit('activeTaskStart', activeTask);
            });
        };
      } else {
        // Otherwise, add it immediatelly...
        task.elapsed += diff;
      }
    }
    task.measured = now;
    task.status = 'active';
    if (!resultCb) {
      this.events.emit('activeTaskStart', activeTask);
    }
    return resultCb;
  }

  clearActivity() {
    if (this.activeTasksList) {
      this.activeTasksList = [];
    }
    if (this.tickHandler) {
      clearInterval(this.tickHandler);
      this.tickHandler = undefined;
    }
  }

  /** @param {TActiveTask[]} activeTasks */
  initTasks(activeTasks) {
    this.clearActivity();
    const initPromises = activeTasks.map((activeTask) => {
      return this.addTask(activeTask, { onInit: true, dontUpdate: true });
    });
    return CommonHelpers.runAsyncCallbacksSequentially(initPromises).finally(() => {
      this.updateActivity();
    });
  }

  /** @param {TActiveTask} activeTask */
  activeTaskFinish(activeTask) {
    const { task } = activeTask;
    // Do final time tick...
    this.activeTaskTick(activeTask);
    delete task.measured;
    task.status = 'completed';
    this.events.emit('activeTaskFinish', activeTask);
  }

  activeTick() {
    const { activeTasksList, callbacks } = this;
    activeTasksList.forEach(callbacks.activeTaskTick);
    this.events.emit('activeTasksUpdated', this.activeTasksList);
  }

  updateActivity() {
    const { activeTasksList, callbacks } = this;
    const hasActiveTasks = activeTasksList.length;
    if (hasActiveTasks) {
      if (!this.tickHandler) {
        this.tickHandler = setInterval(callbacks.activeTick, tickTimeout);
      }
    } else {
      if (this.tickHandler) {
        clearInterval(this.tickHandler);
        this.tickHandler = undefined;
      }
    }
  }

  /**
   * @param {TProjectId} projectId
   * @param {TTaskId} taskId
   */
  indexOfProjectTask(projectId, taskId) {
    const { activeTasksList } = this;
    const idx = activeTasksList.findIndex((activeTask) => {
      return projectId === activeTask.projectId && taskId === activeTask.taskId;
    });
    return idx;
  }
  /**
   * @param {TProjectId} projectId
   * @param {TTaskId} taskId
   */
  hasProjectTask(projectId, taskId) {
    const idx = this.indexOfProjectTask(projectId, taskId);
    return idx !== -1;
  }

  /**
   * @param {TActiveTask} activeTask
   * @param {TActiveTaskStartOpts} opts
   */
  addTask(activeTask, opts = {}) {
    const { activeTasksList } = this;
    activeTasksList.push(activeTask);
    const result = this.activeTaskStart(activeTask, opts);
    if (!opts.dontUpdate) {
      this.updateActivity();
    }
    this.events.emit('activeTasksUpdated', this.activeTasksList);
    return result;
  }

  /** @param {TActiveTask} activeTask */
  removeTask(activeTask) {
    const { activeTasksList } = this;
    const idx = activeTasksList.indexOf(activeTask);
    if (idx === -1) {
      const error = new Error('Can not find active task object in the list');
      // eslint-disable-next-line no-console
      console.error('[ActiveTasksClass:removeTask]', error.message, {
        activeTask,
        activeTasksList,
        error,
      });
      debugger; // eslint-disable-line no-debugger
      // NOTE: Show or throw (and re-catch later)...
      commonNotify.showError(error);
      return;
    }
    this.activeTaskFinish(activeTask);
    activeTasksList.splice(idx, 1);
    this.updateActivity();
    this.events.emit('activeTasksUpdated', this.activeTasksList);
  }

  /**
   * @param {TProjectId} projectId
   * @param {TTaskId} taskId
   */
  removeProjectTask(projectId, taskId) {
    const { activeTasksList } = this;
    const idx = this.indexOfProjectTask(projectId, taskId);
    const activeTask = activeTasksList[idx];
    return this.removeTask(activeTask);
  }
}
