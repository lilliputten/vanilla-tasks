// @ts-check

import * as AppConstants from '../AppConstants.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonNotify } from '../../common/CommonNotify.js';

import { SimpleEvents } from '../../common/SimpleEvents.js';

export class DataStorageClass {
  /** @type {SimpleEvents} */
  events = new SimpleEvents('DataStorage');

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

  /** @constructor */
  constructor() {
    const versionNode = document.getElementById('Version');
    this.version = versionNode.innerText;

    // this.events = new SimpleEvents('DataStorage');
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
