// @ts-check

import * as AppConstants from '../AppConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

export class DataStorageClass {
  /** @type {TCoreParams['appEvents']} */
  events;

  /** @type {string} */
  version;

  /** Projects
   * @type {TProject[]}
   */
  projects = undefined;

  /** Currently displayed project id
   * @type {TProjectId | undefined}
   */
  currentProjectId = undefined;

  /** @constructor
   * @param {TCoreParams} params
   */
  constructor(params) {
    const versionNode = document.getElementById('Version');
    this.version = versionNode.innerText;

    const { appEvents, modules } = params;

    modules.dataStorage = this;

    this.events = appEvents;

    // Load projects data...
    this.loadProjects();

    this.initCurrentProjectId();
  }

  initCurrentProjectId() {
    // Set selected project...
    this.loadCurrentProjectId();

    // Set default project if hasn't set yet...
    if (!this.currentProjectId) {
      this.selectFirstProject();
    }
  }

  // Times...

  /** Recalculate total elapsed time for the project.
   * @param {TProjectId} projectId
   * @returns {boolean} Returns true if project elapsed time has changed
   */
  updateProjectTime(projectId) {
    const { projects, events } = this;
    const project = projects.find(({ id }) => id === projectId);
    if (!project) {
      // ???
      return;
    }
    const { tasks } = project;
    const totalElapsed = tasks.reduce((total, { elapsed }) => {
      return elapsed ? total + elapsed : total;
    }, 0);
    if (totalElapsed !== project.elapsed) {
      project.elapsed = totalElapsed;
      events.emit('updatedProjectTime', project);
      return true;
    }
    return false;
  }

  // Save & load data...

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
      const jsonStr = window.localStorage.getItem(projectsStorageId);
      // NOTE: Do bulletproof json parsing (inside try/catch)...
      try {
        const projects = jsonStr && jsonStr !== 'undefined' ? JSON.parse(jsonStr) : [];
        this.projects = projects;
      } catch (error) {
        const errMsg = ['Data parsing error', CommonHelpers.getErrorText(error)]
          .filter(Boolean)
          .join(': ');
        const dataError = new Error(errMsg);
        // eslint-disable-next-line no-console
        console.error('[DataStorageClass:loadProjects]: get data error', {
          dataError,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        commonNotify.showError(error);
      }
    }
  }

  saveProjects() {
    if (window.localStorage) {
      const { projectsStorageId } = AppConstants;
      const projectsJson = JSON.stringify(this.projects);
      window.localStorage.setItem(projectsStorageId, projectsJson);
    }
  }

  loadCurrentProjectId() {
    const { projects } = this;
    const hasProjects = Array.isArray(projects) && projects.length;
    if (window.localStorage && hasProjects) {
      const { currentProjectIdStorageId } = AppConstants;
      const currentProjectId = window.localStorage.getItem(currentProjectIdStorageId);
      // Is this existed project id?
      if (currentProjectId && projects.find(({ id }) => id === currentProjectId)) {
        this.currentProjectId = currentProjectId;
      }
    }
  }

  saveCurrentProjectId() {
    if (window.localStorage) {
      const { currentProjectIdStorageId } = AppConstants;
      window.localStorage.setItem(currentProjectIdStorageId, this.currentProjectId);
    }
  }

  // Actions...

  /** @param {TProject[]} projects */
  setNewProjects(projects) {
    this.projects = projects;
    this.initCurrentProjectId();
    this.saveProjects();
    this.saveCurrentProjectId();
    this.events.emit('newProjects', { projects });
  }

  /** @param {TProject[]} projects */
  setProjects(projects) {
    this.projects = projects;
    this.saveProjects();
    this.events.emit('updatedProjects', { projects });
  }

  /** @param {TProjectId} currentProjectId */
  setCurrentProjectId(currentProjectId) {
    this.currentProjectId = currentProjectId;
    this.saveCurrentProjectId();
    this.events.emit('currentProjectIdUpdated', { currentProjectId });
  }
}
