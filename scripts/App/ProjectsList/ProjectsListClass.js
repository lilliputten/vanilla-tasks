// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

import { DragListItems } from '../DragListItems/DragListItems.js';

import { TasksListClass } from '../TasksList/TasksListClass.js';

import * as ProjectsListHelpers from './ProjectsListHelpers.js';

const useDragListItems = true;

export class ProjectsListClass {
  /** @type {TProjectsListClassParams['dataStorage']} */
  dataStorage;

  /** @type {TProjectsListClassParams['activeTasks']} */
  activeTasks;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {DragListItems} */
  dragListItems = undefined;

  /** @type {TasksListClass} */
  tasksList = undefined;

  /** @type {HTMLElement} */
  toolbarNode = undefined;

  /** @type {HTMLElement} */
  layoutNode = undefined;

  /** @type {HTMLElement} */
  sectionNode = undefined;

  /** @type {HTMLElement} */
  listNode = undefined;

  uniqIdCounter = 1;
  projectIdPrefix = 'project-';

  // Core...

  /** @constructor
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { layoutNode, dataStorage, activeTasks } = params;
    this.layoutNode = layoutNode;
    this.dataStorage = dataStorage;
    this.activeTasks = activeTasks;

    this.initDomNodes(params);

    // Init handler callbacks...
    callbacks.onDragFinish = this.onDragFinish.bind(this);
    callbacks.onTasksChanged = this.onTasksChanged.bind(this);
    callbacks.onUpdateTextInputProjectName = this.onUpdateTextInputProjectName.bind(this);
    callbacks.onEditProjectNameAction = this.onEditProjectNameAction.bind(this);
    callbacks.onRemoveProjectAction = this.onRemoveProjectAction.bind(this);
    callbacks.onProjectItemClickAction = this.onProjectItemClickAction.bind(this);
    callbacks.onAddProjectAction = this.onAddProjectAction.bind(this);
    callbacks.onNewProjects = this.onNewProjects.bind(this);
    callbacks.onActiveTasksUpdated = this.onActiveTasksUpdated.bind(this);

    activeTasks.events.add('activeTasksUpdated', callbacks.onActiveTasksUpdated);
    // TODO activeTaskFinish

    this.dataStorage.events.add('newProjects', callbacks.onNewProjects);

    this.tasksList = new TasksListClass(params);
    this.tasksList.setTasksChangedCallback(callbacks.onTasksChanged);

    this.renderContent();

    if (useDragListItems) {
      this.dragListItems = new DragListItems({
        dragId: 'projects',
        listNode: this.listNode,
        onDragFinish: callbacks.onDragFinish,
      });
    }
  }

  renderContent() {
    this.renderProjects();
    this.updateCurrentProject();

    // Init toolbar handlers...
    AppHelpers.updateActionHandlers(this.toolbarNode, this.callbacks);

    this.updateStatus();
  }

  // Init...

  /**
   * @param {TProjectsListClassParams} params
   */
  initDomNodes(params) {
    const { layoutNode } = params;

    const sectionNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#ProjectsSection'));
    if (!sectionNode) {
      const error = new Error(`Not found projects section dom node`);
      // eslint-disable-next-line no-console
      console.warn('[ProjectsSectionClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.sectionNode = sectionNode;

    const listNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#ProjectsList'));
    if (!listNode) {
      const error = new Error(`Not found projects list dom node`);
      // eslint-disable-next-line no-console
      console.warn('[ProjectsListClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.listNode = listNode;

    const toolbarNode = /** @type {HTMLElement} */ (layoutNode.querySelector('#ProjectsToolbar'));
    if (!toolbarNode) {
      const error = new Error(`Not found projects toolbar dom node`);
      // eslint-disable-next-line no-console
      console.warn('[ProjectsToolbarClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.toolbarNode = toolbarNode;
  }

  // Action helpers...

  updateStatus() {
    const { sectionNode } = this;
    const { projects } = this.dataStorage;
    const isEmpty = !Array.isArray(projects) || !projects.length;
    sectionNode.classList.toggle('Empty', isEmpty);
    this.tasksList.updateStatus();
  }

  updateCurrentProject() {
    const { projects, currentProjectId } = this.dataStorage;
    const project = projects.find(({ id }) => id === currentProjectId);
    this.tasksList.setProject(project);
    // Show project tasks
    this.updateStatus();
  }

  /** @param {TProjectId | undefined} projectId */
  setCurrentProject(projectId) {
    const { listNode } = this;
    const { currentProjectId } = this.dataStorage;
    if (projectId === currentProjectId) {
      return;
    }
    const prevSelector = [
      // prettier-ignore
      '.Project.Item.Current',
      projectId && `:not([id="${projectId}"])`,
    ]
      .filter(Boolean)
      .join('');
    const prevCurrentNodes = listNode.querySelectorAll(prevSelector);
    const nextCurrentNode = projectId && listNode.querySelector(`.Project.Item[id="${projectId}"]`);
    /* console.log('[ProjectsListClass:setCurrentProject]', {
     *   projectId,
     *   prevCurrentNodes,
     *   nextCurrentNode,
     * });
     */
    prevCurrentNodes.forEach((item) => {
      item.classList.toggle('Current', false);
    });
    this.currentProjectId = projectId;
    this.dataStorage.setCurrentProjectId(projectId); // saveCurrentProjectId();
    if (nextCurrentNode) {
      nextCurrentNode.classList.toggle('Current', true);
    }
    this.updateCurrentProject();
  }

  /**
   * @param {TProjectId} projectId
   * @return {TProject | undefined}
   */
  getProjectById(projectId) {
    const { projects } = this.dataStorage;
    const foundProject = projects.find(({ id }) => id === projectId);
    return foundProject;
  }

  /**
   * @param {TProjectId} projectId
   * @return {boolean}
   */
  hasProjectId(projectId) {
    const foundProject = this.getProjectById(projectId);
    return !!foundProject;
  }

  /** @return {TProjectId} */
  getUniqProjectId() {
    /** @type {TProjectId} */
    let projectId;
    do {
      projectId = /** @type {TProjectId} */ (this.projectIdPrefix + this.uniqIdCounter++);
    } while (this.hasProjectId(projectId));
    return projectId;
  }

  /**
   * @param {TProjectId} projectId
   * @param {string} name
   */
  setProjectName(projectId, name) {
    const { projects } = this.dataStorage;
    const project = projects.find(({ id }) => id === projectId);
    project.name = name;
    project.updated = Date.now();
    this.tasksList.setProjectName(name);
    this.updateStatus();
    this.dataStorage.setProjects(projects);
  }

  // Actions...

  /** Finish items order change */
  onDragFinish() {
    const { dragListItems } = this;
    const { projects } = this.dataStorage;
    dragListItems.commitMove(projects);
    this.updateStatus();
    this.dataStorage.setProjects(projects);
  }

  /**
   * @param {TProjectId} projectId
   * @param {TTask[]} tasks
   */
  onTasksChanged(projectId, tasks) {
    const { projects } = this.dataStorage;
    const project = projects.find(({ id }) => id === projectId);
    project.tasks = tasks;
    this.dataStorage.setProjects(projects);
    this.updateProjectItemTitle(projectId);
  }

  /** @param {Event} event */
  onUpdateTextInputProjectName(event) {
    event.preventDefault();
    const node = /** @type {HTMLInputElement} */ (event.currentTarget);
    const name = node.value;
    const projectNode = node.closest('.Project.Item');
    const projectId = projectNode.id;
    // Store data...
    this.setProjectName(projectId, name);
  }

  /** @param {PointerEvent} event */
  onEditProjectNameAction(event) {
    const { projects } = this.dataStorage;
    event.preventDefault();
    const projectNode = ProjectsListHelpers.getEventProjectNode(event);
    const projectId = projectNode.id;
    const project = projects.find(({ id }) => id === projectId);
    if (!project) {
      // ???
      return;
    }
    AppHelpers.editTextValueModal('projectName', 'Edit Project Name', 'Project Name', project.name)
      .then((name) => {
        const titleText = projectNode.querySelector('.TitleText');
        // Set the new title for the dom node...
        if (titleText.tagName === 'INPUT') {
          const inputText = /** @type {HTMLInputElement} */ (titleText);
          inputText.value = name;
        } else {
          titleText.innerHTML = CommonHelpers.quoteHtmlAttr(name);
        }
        // Save data...
        this.setProjectName(projectId, name);
      })
      .catch(CommonHelpers.NOOP);
  }

  /** @param {PointerEvent} event */
  onRemoveProjectAction(event) {
    event.preventDefault();
    const projectNode = ProjectsListHelpers.getEventProjectNode(event);
    const projectId = projectNode.id;
    AppHelpers.confirmationModal(
      'removeProject',
      'Remove project?',
      'Are you sure to delete the project?',
    )
      .then(() => {
        const { projects } = this.dataStorage;
        const projectIdx = projects.findIndex(({ id }) => id === projectId);
        if (projectIdx !== -1) {
          projects.splice(projectIdx, 1);
          this.dataStorage.setProjects(projects);
        }
        projectNode.remove();
        this.setCurrentProject(undefined);
      })
      .catch(CommonHelpers.NOOP);
  }

  onAddProjectAction() {
    AppHelpers.editTextValueModal('projectName', 'New Project Name', 'Project Name', '')
      .then((name) => {
        const { projects } = this.dataStorage;
        const currTimestamp = Date.now();
        const projectId = this.getUniqProjectId();
        /** @type {TProject} */
        const project = {
          id: projectId,
          name,
          tasks: [],
          created: currTimestamp,
          updated: currTimestamp,
        };
        projects.push(project);
        this.dataStorage.setProjects(projects);
        const projectNodeTemplate = this.renderProjectItem(project);
        const projectNodeCollection = CommonHelpers.htmlToElements(projectNodeTemplate);
        const projectNode = /** @type {HTMLElement} */ (projectNodeCollection[0]);
        this.listNode.append(projectNode);
        AppHelpers.updateActionHandlers(projectNode, this.callbacks);
        this.dragListItems?.updateDragHandlers();
        this.setCurrentProject(projectId);
      })
      .catch(CommonHelpers.NOOP);
  }

  /** Select project
   * @param {PointerEvent} event
   */
  onProjectItemClickAction(event) {
    const { currentProjectId } = this.dataStorage;
    const projectId = ProjectsListHelpers.getEventProjectId(event);
    // TODO: Check if projectId has been defined?
    if (!projectId || projectId === currentProjectId) {
      return;
    }
    this.setCurrentProject(projectId);
  }

  onNewProjects() {
    this.renderContent();
  }

  /** @param {TActiveTask[]} _activeTasksList */
  onActiveTasksUpdated(_activeTasksList) {
    const { activeTasks, dataStorage, tasksList } = this;
    // const { currentProjectId } = dataStorage;
    /** @type {TProjectId[]} */
    const activeProjectIds = activeTasks.getActiveTaskProjects();
    if (!activeProjectIds.length) {
      return;
    }
    const updatedProjectIds = activeProjectIds
      .map((projectId) => {
        return dataStorage.updateProjectTime(projectId) && projectId;
      })
      .filter(Boolean);
    const hasUpdatedProjects = !!updatedProjectIds.length;
    if (!hasUpdatedProjects) {
      return;
    }
    /* // DEBUG
     * const hasCurrentProjectUpdated =
     *   hasUpdatedProjects && updatedProjectIds.includes(currentProjectId);
     * console.log('[ProjectsListClass:onActiveTasksUpdated]', {
     *   hasUpdatedProjects,
     *   hasCurrentProjectUpdated,
     *   updatedProjectIds,
     *   activeProjectIds,
     *   activeTasks,
     * });
     */
    updatedProjectIds.forEach((projectId) => {
      this.updateProjectItemTitle(projectId);
    });
    tasksList.updateToolbarTitle();
    dataStorage.saveProjects();
  }

  // Render...

  /** @param {TProject} project */
  getProjectTitleContent(project) {
    const { name, tasks, elapsed } = project;
    const tasksStatsStr = AppHelpers.getTasksStatsStr(tasks);
    const projectTime = elapsed && CommonHelpers.formatDuration(elapsed);
    const infoStr = [
      // prettier-ignore
      projectTime,
      tasksStatsStr,
    ]
      .filter(Boolean)
      .join(', ');
    const title = [
      /* // NOTE: It's possible to use inputs or just text nodes (with `GhostInput` here and `WithTextInput` for title nodes)
       * `<input class="TitleText InputText FullWidth GhostInput" value="${CommonHelpers.quoteHtmlAttr(name)}" change-action-id="onUpdateTextInputProjectName" />`,
       */
      `<span class="TitleText">${CommonHelpers.quoteHtmlAttr(name)}</span>`,
      tasksStatsStr && `<span class="Info Small">(${infoStr})</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    return title;
  }

  /** @param {TProjectId} projectId */
  updateProjectItemTitle(projectId) {
    const { sectionNode } = this;
    const { projects } = this.dataStorage;
    const project = projects.find(({ id }) => id === projectId);
    const titleContent = this.getProjectTitleContent(project);
    const node = sectionNode.querySelector(
      `.Project.Item[id="${CommonHelpers.quoteHtmlAttr(projectId)}"] > .Title`,
    );
    node.innerHTML = titleContent;
  }

  /**
   * @param {TProject} project
   * @return string
   */
  renderProjectItem(project) {
    const { id } = project;
    const { currentProjectId } = this.dataStorage;
    const isCurrent = id === currentProjectId;
    const titleContent = this.getProjectTitleContent(project);
    const className = [
      // prettier-ignore
      'Project',
      'Item',
      'Active',
      isCurrent && 'Current',
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
<div class="${className}" id="${id}" click-action-id="onProjectItemClickAction" drag-id="projects"${optionalAttrs}>
  <div class="Title -WithTextInput">${titleContent}</div>
  <div class="Actions">
    <!-- Edit -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      click-action-id="onEditProjectNameAction"
      title="Edit Project Name"
    >
      <span class="icon fa fa-pencil"></span>
    </button>
    <!-- Remove -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      click-action-id="onRemoveProjectAction"
      title="Remove Project"
    >
      <span class="icon fa fa-trash"></span>
    </button>
  </div>
</div>
    `;
  }

  /**
   * @param {TProject[]} projects
   */
  renderProjectsContent(projects) {
    let items = ['<div class="Info InfoWrapper EmptyMessage">No projects to display</div>'];
    if (Array.isArray(projects) && projects.length) {
      items = items.concat(projects.map(this.renderProjectItem.bind(this)));
    }
    return items.join('\n');
  }

  /**
   * @param {HTMLElement} node
   * @param {TProject[]} projects
   */
  renderProjectsToNode(node, projects) {
    const content = this.renderProjectsContent(projects);
    CommonHelpers.updateNodeContent(node, content);
    AppHelpers.updateActionHandlers(node, this.callbacks);
  }

  /** Render all the projects to the list node
   */
  renderProjects() {
    const { projects } = this.dataStorage;
    this.renderProjectsToNode(this.listNode, projects);
    this.updateStatus();
    this.dragListItems?.updateDragHandlers();
  }
}
