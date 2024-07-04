// @ts-check

import * as AppConstants from '../AppConstants.js';

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

    // Set selected project...
    this.loadCurrentProjectId();

    // Set default project if hasn't set yet...
    if (!this.currentProjectId) {
      this.selectFirstProject();
    }
  }

  // Save & load data...

  // \<\(selectFirstProject\|loadProjects\|saveProjects\|loadCurrentProjectId\|saveCurrentProjectId\)\>

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
      // TODO: Do bulletproof json parsing (inside try/catch)?
      const projects = projectsJson && projectsJson !== 'undefined' ? JSON.parse(projectsJson) : [];
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
  setProjects(projects) {
    this.projects = projects;
    this.saveProjects();
    this.events.emit('projectsUpdated', { projects });
  }

  /** @param {TProjectId} currentProjectId */
  setCurrentProjectId(currentProjectId) {
    this.currentProjectId = currentProjectId;
    this.saveCurrentProjectId();
    this.events.emit('currentProjectIdUpdated', { currentProjectId });
  }
}
