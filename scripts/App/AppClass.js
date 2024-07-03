// @ts-check

import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';

export class AppClass {
  /**
   * @type {ProjectsListClass}
   */
  processList = undefined;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    this.processList = new ProjectsListClass(sharedParams);
  }
}
