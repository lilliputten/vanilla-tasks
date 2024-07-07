// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';
import * as AppConstants from '../AppConstants.js';

import { DragListItems } from '../DragListItems/DragListItems.js';

import * as TasksListHelpers from './TasksListHelpers.js';

const useDragListItems = true;

const showTaskInfoToolbar = true;

export class TasksListClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {TProjectsListClassParams['dataStorage']} */
  dataStorage;

  /** @type {TProjectsListClassParams['activeTasks']} */
  activeTasks;

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
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    // Will be initialized in `handlers` instance...
    const { callbacks } = this;

    const { layoutNode, dataStorage, activeTasks } = params;
    this.layoutNode = layoutNode;
    this.dataStorage = dataStorage;
    this.activeTasks = activeTasks;

    this.initDomNodes();

    // Init handler callbacks...
    callbacks.onDragFinish = this.onDragFinish.bind(this);
    callbacks.onChangeTaskStatus = this.onChangeTaskStatus.bind(this);
    callbacks.onUpdateTextInputTaskName = this.onUpdateTextInputTaskName.bind(this);
    callbacks.onEditTaskNameAction = this.onEditTaskNameAction.bind(this);
    callbacks.onRemoveTaskAction = this.onRemoveTaskAction.bind(this);
    callbacks.onAddTaskAction = this.onAddTaskAction.bind(this);
    callbacks.onActiveTaskUpdated = this.onActiveTaskUpdated.bind(this);

    activeTasks.events.add('activeTaskTick', callbacks.onActiveTaskUpdated);
    activeTasks.events.add('activeTaskStart', callbacks.onActiveTaskUpdated);
    activeTasks.events.add('activeTaskFinish', callbacks.onActiveTaskUpdated);

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

  initDomNodes() {
    const { layoutNode } = this;

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
    sectionNode.setAttribute('project-id', projectId || '');
    this.updateToolbarTitle();
  }

  updateToolbarTitle() {
    if (!showTaskInfoToolbar) {
      return;
    }
    const { projectId, projectName, tasks, toolbarNode, dataStorage } = this;
    const { projects } = dataStorage;
    /** @type {TProject} */
    const project = projects.find(({ id }) => id === projectId);
    const elapsed = project?.elapsed;
    const titleContent = projectName
      ? CommonHelpers.quoteHtmlAttr(projectName)
      : '<span class="Info">No selected project</span>';
    const tasksStatsStr = AppHelpers.getTasksStatsStr(tasks);
    const projectTime = elapsed && CommonHelpers.formatDuration(elapsed);
    const infoStr = [
      // prettier-ignore
      projectTime,
      tasksStatsStr,
    ]
      .filter(Boolean)
      .join(', ');
    const titleNode = toolbarNode.querySelector('.TitleText');
    const infoNode = toolbarNode.querySelector('.Info');
    titleNode.innerHTML = titleContent;
    infoNode.innerHTML = tasksStatsStr ? `(${infoStr})` : '';
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
    const { projectId, activeTasks } = this;
    event.preventDefault();
    const node = /** @type {HTMLElement} */ (event.currentTarget);
    const taskNode = node.closest('.Task.Item');
    const taskStatus = taskNode.getAttribute('status');
    const taskId = taskNode.id;
    /** @type {TTask} */
    const task = this.tasks.find(({ id }) => id === taskId);
    // Change status: pending -> active, active <-> completed
    const nextStatus = taskStatus === 'active' ? 'completed' : 'active';
    const hasActiveTask = activeTasks.hasProjectTask(projectId, taskId);
    if (nextStatus === 'active') {
      if (!hasActiveTask) {
        /** @type {TActiveTask} */
        const activeTask = {
          projectId,
          taskId,
          task,
        };
        activeTasks.addTask(activeTask);
      }
    } else {
      if (hasActiveTask) {
        activeTasks.removeProjectTask(projectId, taskId);
      }
    }
    // Update data & dom node status...
    task.status = nextStatus;
    taskNode.setAttribute('status', nextStatus);
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
          titleText.innerHTML = CommonHelpers.quoteHtmlAttr(name);
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
        this.updateStatus();
        // Call tasks changed callback
        if (this.tasksChangedCallback) {
          this.tasksChangedCallback(this.projectId, this.tasks);
        }
      })
      .catch(CommonHelpers.NOOP);
  }

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
        this.listNode.append(taskNode);
        AppHelpers.updateActionHandlers(taskNode, this.callbacks);
        this.dragListItems?.updateDragHandlers();
        // Call tasks changed callback
        if (this.tasksChangedCallback) {
          this.tasksChangedCallback(this.projectId, this.tasks);
        }
        this.updateStatus();
      })
      .catch(CommonHelpers.NOOP);
  }

  /** @param {TActiveTask} activeTask */
  onActiveTaskUpdated(activeTask) {
    const { listNode } = this;
    const { projectId, taskId, task } = activeTask;
    const { elapsed } = task;
    // Update times only for current project' nodes...
    if (projectId !== this.projectId) {
      return;
    }
    const elapsedStr = CommonHelpers.formatDuration(elapsed);
    const timeNode = listNode.querySelector(`.Task.Item#${taskId} .Time`);
    if (timeNode) {
      timeNode.innerHTML = elapsedStr;
    }
  }

  // Render...

  /**
   * @param {TTask} task
   * @return string
   */
  renderTaskItem(task) {
    const { id, name, status = AppConstants.defaultTaskStatus, elapsed = 0 } = task;
    const elapsedStr = CommonHelpers.formatDuration(elapsed);
    // const isCurrent = id === this.currentTaskId;
    // const titleContent = `<span class="TitleText">${name}</span>`;
    const titleContent = [
      /* // NOTE: It's possible to use inputs or just text nodes (with `GhostInput` here and `WithTextInput` for title nodes)
       * `<input class="TitleText InputText FullWidth GhostInput" value="${CommonHelpers.quoteHtmlAttr(name)}" change-action-id="onUpdateTextInputTaskName" />`,
       */
      `<span class="TitleText">${CommonHelpers.quoteHtmlAttr(name)}</span>`,
      // tasksStatsStr && `<span class="Info Small">(${tasksStatsStr})</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    const className = [
      // prettier-ignore
      'Task',
      'Item',
      // 'Active', // NOTE: Task nodes aren't active.
      // isCurrent && 'Current', // NOTE: We don't have se;lction for task nodes.
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
<div
  class="${className}"
  id="${CommonHelpers.quoteHtmlAttr(id)}"
  --click-action-id="onTaskItemClickAction"
  drag-id="tasks"${optionalAttrs}
  status="${status}"
>
  <button
    class="StatusIcon ActionButton IconButton NoIconFade ThemeLight"
    id="Status"
    click-action-id="onChangeTaskStatus"
  >
    <i class="Status pending fa fa-clock-o" title="Pending"></i>
    <i class="Status active fa fa-play-circle" title="In Progress"></i>
    <i class="Status completed fa fa-check" title="Completed"></i>
  </button>
  <div class="Time">${elapsedStr}</div>
  <div class="Title">${titleContent}</div>
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
