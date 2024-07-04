// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

import { DragListItems } from '../DragListItems/DragListItems.js';

import * as TasksListHelpers from './TasksListHelpers.js';

const useDragListItems = true;

const showTaskInfoToolbar = true;

export class TasksListClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {DragListItems} */
  dragListItems = undefined;

  /** @type {HTMLElement} */
  layoutNode = undefined;

  /** @type {HTMLElement} */
  toolbarNode = undefined;

  /** @type {HTMLElement} */
  sectionNode = undefined;

  /** @type {HTMLElement} */
  listNode = undefined;

  /** Current project id
   * @type {TProjectId} */
  projectId = undefined;

  /** Tasks list`
   * @type {TTask[]}
   */
  tasks = undefined;

  /** Currently displayed task id
   * @type {TTaskId | undefined}
   */
  currentTaskId = undefined;

  /** @type {TTasksChangedCallback} */
  tasksChangedCallback = undefined;

  uniqIdCounter = 1;
  taskIdPrefix = 'task-';

  // Core...

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // Will be initialized in `handlers` instance...
    const { callbacks } = this;

    this.initDomNodes(sharedParams);

    const { layoutNode } = sharedParams;

    this.layoutNode = layoutNode;

    // Init handler callbacks...
    callbacks.onDragFinish = this.onDragFinish.bind(this);
    callbacks.onChangeTaskStatus = this.onChangeTaskStatus.bind(this);
    callbacks.onUpdateTextInputTaskName = this.onUpdateTextInputTaskName.bind(this);
    callbacks.onEditTaskNameAction = this.onEditTaskNameAction.bind(this);
    callbacks.onRemoveTaskAction = this.onRemoveTaskAction.bind(this);
    callbacks.onAddTaskAction = this.onAddTaskAction.bind(this);

    // Init toolbar handlers...
    AppHelpers.updateActionHandlers(this.toolbarNode, this.callbacks);

    if (useDragListItems) {
      this.dragListItems = new DragListItems({
        dragId: 'tasks',
        listNode: this.listNode,
        onDragFinish: callbacks.onDragFinish,
      });
    }
  }

  // Init...

  /** @param {TTasksChangedCallback} cb */
  setTasksChangedCallback(cb) {
    this.tasksChangedCallback = cb;
  }

  /** Set project data
   * @param {TProject | undefined} project
   */
  setProject(project) {
    const { id, name, tasks } = project || {};
    // TODO: Reset/clean previous data?
    this.projectId = id;
    this.projectName = name;
    this.tasks = tasks;
    // Reset unique id counter
    this.uniqIdCounter = 1;
    // Reset current task id
    this.currentTaskId = undefined;
    // Update status and render content...
    this.updateStatus();
    this.renderTasks();
  }

  /** @param {string} name */
  setProjectName(name) {
    this.projectName = name;
    this.updateStatus();
  }

  /**
   * @param {TSharedParams} sharedParams
   */
  initDomNodes(sharedParams) {
    const { layoutNode } = sharedParams;

    const sectionNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#TasksSection'));
    if (!sectionNode) {
      const error = new Error(`Not found tasks section dom node`);
      // eslint-disable-next-line no-console
      console.warn('[TasksSectionClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.sectionNode = sectionNode;

    const listNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#TasksList'));
    if (!listNode) {
      const error = new Error(`Not found tasks list dom node`);
      // eslint-disable-next-line no-console
      console.warn('[TasksListClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.listNode = listNode;

    const toolbarNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#TasksToolbar'));
    if (!toolbarNode) {
      const error = new Error(`Not found tasks toolbar dom node`);
      // eslint-disable-next-line no-console
      console.warn('[TasksToolbarClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.toolbarNode = toolbarNode;
  }

  // Action helpers...

  updateStatus() {
    const { projectId, tasks, sectionNode } = this;
    const hasProject = !!projectId;
    const hasTasks = !!Array.isArray(tasks) && !!tasks.length;
    sectionNode.classList.toggle('Empty', !hasTasks);
    sectionNode.classList.toggle('NoProject', !hasProject);
    this.updateToolbarTitle();
  }

  updateToolbarTitle() {
    if (!showTaskInfoToolbar) {
      return;
    }
    const { projectName, tasks, toolbarNode } = this;
    const title = projectName || '<span class="Info">No selected project</span>';
    const tasksStatsStr = AppHelpers.getTasksStatsStr(tasks);
    const titleNode = toolbarNode.querySelector('.TitleText');
    const infoNode = toolbarNode.querySelector('.Info');
    titleNode.innerHTML = title;
    infoNode.innerHTML = tasksStatsStr ? `(${tasksStatsStr})` : '';
  }

  /** @param {TTaskId | undefined} taskId */
  setCurrentTask(taskId) {
    const { currentTaskId, listNode } = this;
    if (taskId === currentTaskId) {
      return;
    }
    const prevSelector = [
      // prettier-ignore
      '.Task.Item.Current',
      taskId && `:not([id="${taskId}"])`,
    ]
      .filter(Boolean)
      .join('');
    const prevCurrentNodes = listNode.querySelectorAll(prevSelector);
    const nextCurrentNode = taskId && listNode.querySelector(`.Task.Item[id="${taskId}"]`);
    /* console.log('[TasksListClass:setCurrentTask]', {
     *   taskId,
     *   prevCurrentNodes,
     *   nextCurrentNode,
     * });
     */
    prevCurrentNodes.forEach((item) => {
      item.classList.toggle('Current', false);
    });
    this.currentTaskId = taskId;
    if (nextCurrentNode) {
      nextCurrentNode.classList.toggle('Current', true);
    }
    // Show task tasks
    this.updateStatus();
  }

  /**
   * @param {TTaskId} taskId
   * @return {TTask | undefined}
   */
  getTaskById(taskId) {
    const foundTask = this.tasks.find(({ id }) => id === taskId);
    return foundTask;
  }

  /**
   * @param {TTaskId} taskId
   * @return {boolean}
   */
  hasTaskId(taskId) {
    const foundTask = this.getTaskById(taskId);
    return !!foundTask;
  }

  /** @return {TTaskId} */
  getUniqTaskId() {
    /** @type {TTaskId} */
    let taskId;
    do {
      taskId = /** @type {TTaskId} */ (this.taskIdPrefix + this.uniqIdCounter++);
    } while (this.hasTaskId(taskId));
    return taskId;
  }

  /**
   * @param {TTaskId} taskId
   * @param {string} name
   */
  setTaskName(taskId, name) {
    const task = this.tasks.find(({ id }) => id === taskId);
    task.name = name;
    task.updated = Date.now();
    this.updateStatus();
    // Call tasks changed callback
    if (this.tasksChangedCallback) {
      this.tasksChangedCallback(this.projectId, this.tasks);
    }
  }

  // Actions...

  /** Finish items order change */
  onDragFinish() {
    const { tasks, dragListItems } = this;
    dragListItems.commitMove(tasks);
    this.updateStatus();
    // Call tasks changed callback
    if (this.tasksChangedCallback) {
      this.tasksChangedCallback(this.projectId, this.tasks);
    }
  }

  /** @param {Event} event */
  onChangeTaskStatus(event) {
    event.preventDefault();
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const taskNode = node.closest('.Task.Item');
    const taskId = taskNode.id;
    const task = this.tasks.find(({ id }) => id === taskId);
    // Toggle status
    const newCompleted = !task.completed;
    // Update data & dom node status...
    task.completed = newCompleted;
    taskNode.classList.toggle('Completed', newCompleted);
    // Store data...
    this.updateStatus();
    // Call tasks changed callback
    if (this.tasksChangedCallback) {
      this.tasksChangedCallback(this.projectId, this.tasks);
    }
  }

  /** @param {Event} event */
  onUpdateTextInputTaskName(event) {
    event.preventDefault();
    const node = /** @type {HTMLInputElement} */ (event.currentTarget);
    const name = node.value;
    const taskNode = node.closest('.Task.Item');
    const taskId = taskNode.id;
    // Store data...
    this.setTaskName(taskId, name);
  }

  /** @param {PointerEvent} event */
  onEditTaskNameAction(event) {
    event.preventDefault();
    const taskNode = TasksListHelpers.getEventTaskNode(event);
    const taskId = taskNode.id;
    const task = this.tasks.find(({ id }) => id === taskId);
    if (!task) {
      // ???
      return;
    }
    AppHelpers.editTextValueModal('taskName', 'Edit Task Name', 'Task Name', task.name)
      .then((name) => {
        const titleText = taskNode.querySelector('.TitleText');
        // Set the new title for the dom node...
        if (titleText.tagName === 'INPUT') {
          const inputText = /** @type {HTMLInputElement} */ (titleText);
          inputText.value = name;
        } else {
          titleText.innerHTML = name;
        }
        // Save data...
        this.setTaskName(taskId, name);
      })
      .catch(CommonHelpers.NOOP);
  }

  /** @param {PointerEvent} event */
  onRemoveTaskAction(event) {
    event.preventDefault();
    const taskNode = TasksListHelpers.getEventTaskNode(event);
    const taskId = taskNode.id;
    AppHelpers.confirmationModal('removeTask', 'Remove task?', 'Are you sure to delete the task?')
      .then(() => {
        const taskIdx = this.tasks.findIndex(({ id }) => id === taskId);
        if (taskIdx !== -1) {
          this.tasks.splice(taskIdx, 1);
        }
        taskNode.remove();
        this.setCurrentTask(undefined);
        this.updateStatus();
        // Call tasks changed callback
        if (this.tasksChangedCallback) {
          this.tasksChangedCallback(this.projectId, this.tasks);
        }
      })
      .catch(CommonHelpers.NOOP);
  }

  /* *** Select task
   *  * @param {PointerEvent} event
   *  **
   * onTaskItemClickAction(event) {
   *   const { currentTaskId } = this;
   *   const taskId = TasksListHelpers.getEventTaskId(event);
   *   // TODO: Check if taskId has been defined?
   *   if (!taskId || taskId === currentTaskId) {
   *     return;
   *   }
   *   this.setCurrentTask(taskId);
   * }
   */

  onAddTaskAction() {
    AppHelpers.editTextValueModal('taskName', 'New Task Name', 'Task Name', '')
      .then((name) => {
        const currTimestamp = Date.now();
        const taskId = this.getUniqTaskId();
        /** @type {TTask} */
        const task = {
          id: taskId,
          name,
          created: currTimestamp,
          updated: currTimestamp,
        };
        this.tasks.push(task);
        const taskNodeTemplate = this.renderTaskItem(task);
        const taskNodeCollection = CommonHelpers.htmlToElements(taskNodeTemplate);
        const taskNode = /** @type {HTMLElement} */ (taskNodeCollection[0]);
        /* console.log('[TasksListClass:onAddTaskAction]', {
         *   task,
         *   taskNodeTemplate,
         *   taskNode,
         *   name,
         * });
         */
        this.listNode.append(taskNode);
        AppHelpers.updateActionHandlers(taskNode, this.callbacks);
        this.dragListItems?.updateDragHandlers();
        this.setCurrentTask(taskId);
        // Call tasks changed callback
        if (this.tasksChangedCallback) {
          this.tasksChangedCallback(this.projectId, this.tasks);
        }
      })
      .catch(CommonHelpers.NOOP);
  }

  // Render...

  /**
   * @param {TTask} task
   * @return string
   */
  renderTaskItem(task) {
    const { id, name, completed } = task;
    const isCurrent = id === this.currentTaskId;
    // const title = `<span class="TitleText">${name}</span>`;
    const title = [
      /* // NOTE: It's possible to use inputs or just text nodes (with `GhostInput` here and `WithTextInput` for title nodes)
       * `<input class="TitleText InputText FullWidth GhostInput" value="${CommonHelpers.quoteHtmlAttr(name)}" change-action-id="onUpdateTextInputTaskName" />`,
       */
      `<span class="TitleText">${name}</span>`,
      // tasksStatsStr && `<span class="Info Small">(${tasksStatsStr})</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    const className = [
      // prettier-ignore
      'Task',
      'Item',
      !!completed && 'Completed',
      // 'Active', // ???
      isCurrent && 'Current', // ???
    ]
      .filter(Boolean)
      .join(' ');
    const optionalAttrs = [
      // prettier-ignore
      useDragListItems && 'draggable="true"',
    ]
      .filter(Boolean)
      .join(' ');
    return `
<div class="${className}" id="${id}" -click-action-id="onTaskItemClickAction" drag-id="tasks"${optionalAttrs}>
  <button class="StatusIcon ActionButton IconButton NoIconFade ThemeLight" id="Complete" click-action-id="onChangeTaskStatus">
    <i class="Status Default fa fa-clock-o" title="Pending"></i>
    <i class="Status Completed fa fa-check" title="Completed"></i>
  </button>
  <div class="Title -WithTextInput">${title}</div>
  <div class="Actions">
    <!-- Edit -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      click-action-id="onEditTaskNameAction"
      title="Edit Task Name"
    >
      <i class="icon fa fa-pencil"></i>
    </button>
    <!-- Remove -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      click-action-id="onRemoveTaskAction"
      title="Remove Task"
    >
      <i class="icon fa fa-trash"></i>
    </button>
  </div>
</div>
    `;
  }

  /**
   * @param {TTask[]} tasks
   */
  renderTasksContent(tasks) {
    let items = ['<div class="Info InfoWrapper EmptyMessage">No tasks to display</div>'];
    if (Array.isArray(tasks) && tasks.length) {
      items = items.concat(tasks.map(this.renderTaskItem.bind(this)));
    }
    return items.join('\n');
  }

  /**
   * @param {HTMLElement} node
   * @param {TTask[]} tasks
   */
  renderTasksToNode(node, tasks) {
    const content = this.renderTasksContent(tasks);
    CommonHelpers.updateNodeContent(node, content);
    AppHelpers.updateActionHandlers(node, this.callbacks);
  }

  /** Render all the tasks to the list node
   */
  renderTasks() {
    this.renderTasksToNode(this.listNode, this.tasks);
    this.updateStatus();
    this.dragListItems?.updateDragHandlers();
  }
}
