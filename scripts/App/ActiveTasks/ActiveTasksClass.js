// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

// import * as AppHelpers from '../AppHelpers.js';
// import * as AppConstants from '../AppConstants.js';

import { SimpleEvents } from '../../common/SimpleEvents.js';

export class ActiveTasksClass {
  /** @type {SimpleEvents} */
  events = new SimpleEvents('ActiveTasks');

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  layoutNode = undefined;

  // [>* @type {TActiveTasksClassParams['dataStorage']} <]
  // dataStorage = undefined;

  /** @type {TActiveTask[]} */
  activeTasksList = [];

  /** @type {TSetTimeout} */
  tickHandler = undefined;

  /** @constructor
   * @param {TSharedParams} sharedParams
   * --@param {TActiveTasksClassParams} params
   */
  constructor(sharedParams) {
    // Will be initialized in `handlers` instance...
    const { callbacks } = this;

    const { layoutNode } = sharedParams;

    this.layoutNode = layoutNode;

    // const { dataStorage } = params;
    // this.dataStorage = dataStorage;

    // Init handler callbacks...
    callbacks.onTickTimer = this.onTickTimer.bind(this);
    callbacks.activeTaskTick = this.activeTaskTick.bind(this);
  }

  /** @param {TActiveTask} activeTask */
  activeTaskTick(activeTask) {
    const { layoutNode } = this;
    const {
      // prettier-ignore
      projectId,
      taskId,
      task,
      // node,
    } = activeTask;
    const {
      // prettier-ignore
      status,
      elapsed,
      measured,
      created,
      updated,
    } = task;
    const now = Date.now();
    const diff = now - measured;
    task.elapsed += diff;
    task.measured = now;
    const elapsedStr = CommonHelpers.formatDuration(task.elapsed);
    const timeNode = layoutNode.querySelector(
      `#TasksSection[project-id="${projectId}"] .Task.Item#${taskId} .Time`,
    );
    timeNode.innerHTML = elapsedStr;
    console.log('[ActiveTasksClass:activeTaskTick]', {
      elapsedStr,
      diff,
      now,
      // Task:
      status,
      elapsed,
      measured,
      created,
      updated,
      // Active task:
      projectId,
      taskId,
      task,
      timeNode,
    });
    this.events.emit('activeTaskTick', activeTask);
  }

  /**
   * @param {TActiveTask} activeTask
   * @param {TActiveTaskStartOpts} opts
   * */
  activeTaskStart(activeTask, opts = {}) {
    const { task } = activeTask;
    const { status, measured } = task;
    const now = Date.now();
    if (opts.isStart /* && status === 'active' */ && measured) {
      const diff = now - measured;
      console.warn('[ActiveTasksClass:activeTaskStart] has measured time', {
        diff,
        measured,
        status,
        task,
        activeTask,
      });
      // TODO: Check for too long time gaps (on initalization?)?
    }
    task.measured = now;
    if (!task.elapsed) {
      task.elapsed = 0;
    }
    console.log('[ActiveTasksClass:activeTaskStart]', {
      now,
      task,
      activeTask,
    });
    // debugger;
    task.status = 'active';
    // TODO: Check and init time properties...
    this.events.emit('activeTaskStart', activeTask);
  }

  /** @param {TActiveTask} activeTask */
  activeTaskFinish(activeTask) {
    const { task } = activeTask;
    console.log('[ActiveTasksClass:activeTaskFinish]', {
      activeTask,
    });
    // TODO: Do final time tick...
    this.activeTaskTick(activeTask);
    task.measured = undefined;
    task.status = 'completed';
    this.events.emit('activeTaskFinish', activeTask);
  }

  onTickTimer() {
    const { activeTasksList, callbacks } = this;
    console.log('[ActiveTasksClass:addTask]', {
      activeTasksList,
    });
    activeTasksList.forEach(callbacks.activeTaskTick);
  }

  updateActivity() {
    const { activeTasksList, callbacks } = this;
    const hasActiveTasks = activeTasksList.length;
    if (hasActiveTasks) {
      if (!this.tickHandler) {
        this.tickHandler = setInterval(callbacks.onTickTimer, 1000);
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
    console.log('[ActiveTasksClass:addTask]', {
      activeTask,
      activeTasksList,
    });
    activeTasksList.push(activeTask);
    this.activeTaskStart(activeTask, opts);
    this.updateActivity();
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
    console.log('[ActiveTasksClass:removeTask]', {
      idx,
      activeTask,
      activeTasksList,
    });
    this.activeTaskFinish(activeTask);
    activeTasksList.splice(idx, 1);
    this.updateActivity();
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
