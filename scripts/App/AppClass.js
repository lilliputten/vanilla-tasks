// @ts-check

import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /**
   * @type {ProjectsListClass}
   */
  processList = undefined;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // const { callbacks } = this;
    // const { layoutNode } = sharedParams;

    this.processList = new ProjectsListClass(sharedParams);

    /* console.log('[AppClass] Ok', {
     *   processList: this.processList,
     *   useDebug,
     *   layoutNode,
     *   callbacks,
     * });
     */
  }
}
