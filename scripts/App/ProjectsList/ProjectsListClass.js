// @ts-check

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';
import * as AppConstants from '../AppConstants.js';

import { DragListItems } from '../DragListItems/DragListItems.js';

import { TasksListClass } from '../TasksList/TasksListClass.js';

import * as ProjectsListHelpers from './ProjectsListHelpers.js';

const NOOP = () => {};

const useDragListItems = true;

export class ProjectsListClass {
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

  /** Projects
   * @type {TProject[]}
   */
  projects = undefined;

  /** Currently displayed project id
   * @type {TProjectId | undefined}
   */
  currentProjectId = undefined;

  uniqIdCounter = 1;
  projectIdPrefix = 'project-';

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

    this.loadProjects();
    this.selectFirstProject();

    // Init handler callbacks...
    callbacks.onDragFinish = this.onDragFinish.bind(this);
    callbacks.onTasksChanged = this.onTasksChanged.bind(this);
    callbacks.onUpdateTextInputProjectName = this.onUpdateTextInputProjectName.bind(this);
    callbacks.onEditProjectNameAction = this.onEditProjectNameAction.bind(this);
    callbacks.onRemoveProjectAction = this.onRemoveProjectAction.bind(this);
    callbacks.onProjectItemClickAction = this.onProjectItemClickAction.bind(this);
    callbacks.onAddProjectAction = this.onAddProjectAction.bind(this);

    this.tasksList = new TasksListClass(sharedParams);
    this.tasksList.setTasksChangedCallback(callbacks.onTasksChanged);

    this.renderProjects();
    this.updateCurrentProject();

    // Init toolbar handlers...
    AppHelpers.updateActionHandlers(this.toolbarNode, this.callbacks);

    if (useDragListItems) {
      this.dragListItems = new DragListItems({
        dragId: 'Projects',
        listNode: this.listNode,
        onDragFinish: callbacks.onDragFinish,
      });
    }
  }

  // Init...

  /**
   * @param {TSharedParams} sharedParams
   */
  initDomNodes(sharedParams) {
    const { layoutNode } = sharedParams;

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
    const { projects, sectionNode } = this;
    const isEmpty = !Array.isArray(projects) || !projects.length;
    sectionNode.classList.toggle('Empty', isEmpty);
    this.tasksList.updateStatus();
  }

  updateCurrentProject() {
    const { currentProjectId } = this;
    const project = this.projects.find(({ id }) => id === currentProjectId);
    this.tasksList.setProject(project);
    // Show project tasks
    this.updateStatus();
  }

  /** @param {TProjectId | undefined} projectId */
  setCurrentProject(projectId) {
    const { currentProjectId, listNode } = this;
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
    const foundProject = this.projects.find(({ id }) => id === projectId);
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
    const project = this.projects.find(({ id }) => id === projectId);
    project.name = name;
    project.updated = Date.now();
    this.tasksList.setProjectName(name);
    this.updateStatus();
    this.saveProjects();
  }

  selectFirstProject() {
    // Set default project
    const { projects } = this;
    if (Array.isArray(projects) && projects.length) {
      this.currentProjectId = projects[0].id;
    } else {
      this.currentProjectId = undefined;
    }
  }

  loadProjects() {
    if (window.localStorage) {
      const { projectsStorageId } = AppConstants;
      const projectsJson = window.localStorage.getItem(projectsStorageId);
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      this.projects = projects;
    }
  }

  saveProjects() {
    if (window.localStorage) {
      const { projectsStorageId } = AppConstants;
      const projectsJson = JSON.stringify(this.projects);
      window.localStorage.setItem(projectsStorageId, projectsJson);
    }
  }

  // Actions...

  /** Finish items order change */
  onDragFinish() {
    const { projects, dragListItems } = this;
    dragListItems.commitMove(projects);
    this.updateStatus();
    this.saveProjects();
  }

  /**
   * @param {TProjectId} projectId
   * @param {TTask[]} _tasks
   */
  onTasksChanged(projectId, _tasks) {
    this.updateProjectItemTitle(projectId);
    this.saveProjects();
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
    event.preventDefault();
    const projectNode = ProjectsListHelpers.getEventProjectNode(event);
    const projectId = projectNode.id;
    const project = this.projects.find(({ id }) => id === projectId);
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
          titleText.innerHTML = name;
        }
        // Save data...
        this.setProjectName(projectId, name);
      })
      .catch(NOOP);
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
        const projectIdx = this.projects.findIndex(({ id }) => id === projectId);
        if (projectIdx !== -1) {
          this.projects.splice(projectIdx, 1);
        }
        projectNode.remove();
        this.setCurrentProject(undefined);
        this.saveProjects();
      })
      .catch(NOOP);
  }

  onAddProjectAction() {
    AppHelpers.editTextValueModal('projectName', 'New Project Name', 'Project Name', '')
      .then((name) => {
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
        this.projects.push(project);
        const projectNodeTemplate = this.renderProjectItem(project);
        const projectNodeCollection = CommonHelpers.htmlToElements(projectNodeTemplate);
        const projectNode = /** @type {HTMLElement} */ (projectNodeCollection[0]);
        /* console.log('[ProjectsListClass:onAddProjectAction]', {
         *   project,
         *   projectNodeTemplate,
         *   projectNode,
         *   name,
         * });
         */
        this.listNode.append(projectNode);
        AppHelpers.updateActionHandlers(projectNode, this.callbacks);
        this.dragListItems?.updateDomNodes();
        this.setCurrentProject(projectId);
        this.saveProjects();
      })
      .catch(NOOP);
  }

  /** Select project
   * @param {PointerEvent} event
   */
  onProjectItemClickAction(event) {
    const { currentProjectId } = this;
    const projectId = ProjectsListHelpers.getEventProjectId(event);
    // TODO: Check if projectId has been defined?
    if (!projectId || projectId === currentProjectId) {
      return;
    }
    /* console.log('[ProjectsListClass:onProjectItemClickAction]', {
     *   projectId,
     *   event,
     * });
     */
    this.setCurrentProject(projectId);
  }

  // Render...

  /** @param {TProject} project */
  getProjectTitleContent(project) {
    const { name, tasks } = project;
    const tasksStatsStr = AppHelpers.getTasksStatsStr(tasks);
    const title = [
      /* // NOTE: It's possible to use inputs or just text nodes (with `GhostInput` here and `WithTextInput` for title nodes)
       * `<input class="TitleText InputText FullWidth GhostInput" value="${CommonHelpers.quoteHtmlAttr(name)}" change-action-id="onUpdateTextInputProjectName" />`,
       */
      `<span class="TitleText">${name}</span>`,
      tasksStatsStr && `<span class="Info Small">(${tasksStatsStr})</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    return title;
  }

  /** @param {TProjectId} projectId */
  updateProjectItemTitle(projectId) {
    const { sectionNode } = this;
    const project = this.projects.find(({ id }) => id === projectId);
    const titleContent = this.getProjectTitleContent(project);
    const node = sectionNode.querySelector(`.Project.Item[id="${projectId}"] > .Title`);
    node.innerHTML = titleContent;
  }

  /**
   * @param {TProject} project
   * @return string
   */
  renderProjectItem(project) {
    const { id } = project;
    const isCurrent = id === this.currentProjectId;
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
    const attrs = [
      // prettier-ignore
      useDragListItems && 'draggable="true"',
    ]
      .filter(Boolean)
      .join(' ');
    return `
<div class="${className}" id="${id}" click-action-id="onProjectItemClickAction"${attrs}>
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
    this.renderProjectsToNode(this.listNode, this.projects);
    this.updateStatus();
    this.dragListItems?.updateDomNodes();
  }
}
