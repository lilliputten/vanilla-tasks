// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
// import { SimpleEvents } from '../../common/SimpleEvents.js';
import { DataStorageClass } from '../DataStorage/DataStorageClass.js';
/* eslint-enable no-unused-vars */

import { ExportDataClass } from '../ImportExport/ExportDataClass.js';
import { ImportDataClass } from '../ImportExport/ImportDataClass.js';

import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

export class MainMenuClass {
  /** @type {DataStorageClass} */
  dataStorage;

  /* @type {ExportDataClass} */
  exportData;

  /* @type {ImportDataClass} */
  importData;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  headerNode;

  /** @constructor
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { dataStorage } = params;
    this.dataStorage = dataStorage;

    this.exportData = new ExportDataClass(params);
    this.importData = new ImportDataClass(params);

    this.initDomNodes();

    // Init handler callbacks...
    callbacks.onMainMenuToggle = this.onMainMenuToggle.bind(this);
    callbacks.onDataExport = this.onDataExport.bind(this);
    callbacks.onDataImport = this.onDataImport.bind(this);

    AppHelpers.updateActionHandlers(this.headerNode, this.callbacks);
  }

  initDomNodes() {
    const headerNode = document.getElementById('PageHeader');
    if (!headerNode) {
      const error = new Error(`Not found page header dom node`);
      // eslint-disable-next-line no-console
      console.warn('[ProjectsHeaderClass:initDomNodes]', error);
      commonNotify.showError(error);
      throw error;
    }
    this.headerNode = headerNode;
  }

  // Actions...

  onDataExport() {
    this.exportData.exportData();
  }

  onDataImport() {
    const { headerNode } = this;
    // eslint-disable-next-line no-console
    console.log('[MainMenuClass:onDataImport]', {
      headerNode,
    });
    this.importData.importData();
  }

  onMainMenuToggle() {
    const { headerNode } = this;
    headerNode.classList.toggle('MenuOpen');
  }
}
