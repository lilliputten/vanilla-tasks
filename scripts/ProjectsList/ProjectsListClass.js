// @ts-check

import { useDebug } from '../common/CommonConstants.js';
import * as CommonHelpers from '../common/CommonHelpers.js';
import * as TaskHelpers from '../common/TaskHelpers.js';
import { commonNotify } from '../common/CommonNotify.js';

import * as ProjectsListHelpers from './ProjectsListHelpers.js';

/** @type {TProject[]} */
const demoProjects = [
  // {
  //   id: 'project-1',
  //   name: 'Project 1',
  //   tasks: [
  //     {
  //       id: 'task-11',
  //       name: 'Task 11',
  //     },
  //   ],
  // },
  // {
  //   id: 'project-2',
  //   name: 'Project 2',
  //   tasks: [
  //     {
  //       id: 'task-21',
  //       name: 'Task 21',
  //     },
  //     {
  //       id: 'task-22',
  //       name: 'Task 22',
  //     },
  //   ],
  // },
];

const NOOP = () => {};

const showProjectInRightToolbar = true;

export class ProjectsListClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  toolbarNode = undefined;

  /** @type {HTMLElement} */
  layoutNode = undefined;

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

    // DEBUG!
    this.projects = demoProjects;

    // eslint-disable-next-line no-console
    console.log('[ProjectsListClass] Ok', {
      useDebug,
      layoutNode,
      callbacks,
    });

    // TODO: Init state

    // Init handler callbacks...
    callbacks.onEditProjectNameAction = this.onEditProjectNameAction.bind(this);
    callbacks.onRemoveProjectAction = this.onRemoveProjectAction.bind(this);
    callbacks.onProjectItemClickAction = this.onProjectItemClickAction.bind(this);
    callbacks.onAddProjectAction = this.onAddProjectAction.bind(this);

    this.renderProjects();

    // Init toolbar handlers...
    TaskHelpers.updateActionHandlers(this.toolbarNode, this.callbacks);

    /* // DEMO: Test common modal
     * this.testModal();
     */
  }

  // Init...

  /**
   * @param {TSharedParams} sharedParams
   */
  initDomNodes(sharedParams) {
    const { layoutNode } = sharedParams;

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

  updateTasksToolbarTitleForCurrentProject() {
    if (!showProjectInRightToolbar) {
      return;
    }
    const { currentProjectId, layoutNode } = this;
    const project = this.projects.find(({ id }) => id === currentProjectId);
    if (project) {
      const { name, tasks } = project;
      const tasksStatsStr = TaskHelpers.getTasksStatsStr(tasks);
      const titleNode = layoutNode.querySelector('#TasksToolbar > .ToolbarTitle > .TitleText');
      const infoNode = layoutNode.querySelector('#TasksToolbar > .ToolbarTitle > .Info');
      titleNode.innerHTML = name;
      infoNode.innerHTML = tasksStatsStr ? `(${tasksStatsStr})` : '';
    }
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
    // Show project tasks
    this.updateTasksToolbarTitleForCurrentProject();
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

  // Actions...

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
    TaskHelpers.editTextValueModal('projectName', 'Edit Project Name', 'Project Name', project.name)
      .then((name) => {
        // Store data...
        project.name = name;
        project.updated = Date.now();
        // Set the new title for the dom node...
        projectNode.querySelector('.TitleText').innerHTML = name;
        // Update the name of the right panel if it's for the current project...
        this.updateTasksToolbarTitleForCurrentProject();
      })
      .catch(NOOP);
  }

  /** @param {PointerEvent} event */
  onRemoveProjectAction(event) {
    event.preventDefault();
    const projectNode = ProjectsListHelpers.getEventProjectNode(event);
    const projectId = projectNode.id;
    TaskHelpers.confirmationModal(
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
        // Update the name of the right panel if it's for the current project...
        this.updateTasksToolbarTitleForCurrentProject();
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

  onAddProjectAction() {
    TaskHelpers.editTextValueModal('projectName', 'New Project Name', 'Project Name', '')
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
        TaskHelpers.updateActionHandlers(projectNode, this.callbacks);
        this.setCurrentProject(projectId);
      })
      .catch(NOOP);
  }

  // Render...

  /**
   * @param {TProject} project
   * @return string
   */
  renderProjectItem(project) {
    const { id, name, tasks } = project;
    const isCurrent = id === this.currentProjectId;
    const tasksStatsStr = TaskHelpers.getTasksStatsStr(tasks);
    const title = [
      `<span class="TitleText">${name}</span>`,
      tasksStatsStr && `<span class="Info Small">(${tasksStatsStr})</span>`,
    ]
      .filter(Boolean)
      .join(' ');
    const className = [
      // prettier-ignore
      'Project',
      'Item',
      'Active',
      isCurrent && 'Current',
    ]
      .filter(Boolean)
      .join(' ');
    return `
<div class="${className}" id="${id}" action-id="onProjectItemClickAction">
  <div class="Title">${title}</div>
  <div class="Actions">
    <!-- Edit -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      action-id="onEditProjectNameAction"
      title="Edit Project Name"
    >
      <i class="fa fa-pencil"></i>
    </button>
    <!-- Remove -->
    <button
      class="ActionButton IconButton NoIconFade ThemeLight"
      action-id="onRemoveProjectAction"
      title="Remove Project"
    >
      <i class="fa fa-trash"></i>
    </button>
  </div>
</div>
    `;
  }

  /**
   * @param {TProject[]} projects
   */
  renderProjectsContent(projects) {
    if (!Array.isArray(projects) || !projects.length) {
      return '<div class="Info InfoWrapper">No projects to display</div>';
    }
    return projects.map(this.renderProjectItem.bind(this)).join('\n');
  }

  /**
   * @param {HTMLElement} node
   * @param {TProject[]} projects
   */
  renderProjectsToNode(node, projects) {
    const content = this.renderProjectsContent(projects);
    CommonHelpers.updateNodeContent(node, content);
    TaskHelpers.updateActionHandlers(node, this.callbacks);
  }

  /** Render all the projects to the list node
   */
  renderProjects() {
    this.renderProjectsToNode(this.listNode, this.projects);
  }
}
