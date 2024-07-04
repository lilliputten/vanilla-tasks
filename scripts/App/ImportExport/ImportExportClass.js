// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
// import { SimpleEvents } from '../../common/SimpleEvents.js';
import { DataStorageClass } from '../DataStorage/DataStorageClass.js';
/* eslint-enable no-unused-vars */

import * as CommonHelpers from '../../common/CommonHelpers.js';
import * as AppHelpers from '../AppHelpers.js';

export class ImportExportClass {
  /** @type {DataStorageClass} */
  dataStorage;

  /** @constructor
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    const { dataStorage } = params;
    this.dataStorage = dataStorage;
  }

  /** @param {string} fileName */
  downloadData(fileName) {
    const { projects, version } = this.dataStorage;
    /** @type {TImportExportData} */
    const data = {
      type: 'vanilla-tasks-data',
      url: 'https://vanilla-tasks.lilliputten.com/',
      version,
      projects,
    };
    const jsonData = JSON.stringify(data, null, 2);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData),
    );
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  exportData() {
    AppHelpers.editTextValueModal(
      'fileName',
      'Enter File Name to Download',
      'File Name',
      'projects.json',
    )
      .then(this.downloadData.bind(this))
      .catch(CommonHelpers.NOOP);
  }

  importData() {
    console.log('[ImportExportClass:importData]');
    debugger;
  }
}
