// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
// import { SimpleEvents } from '../../common/SimpleEvents.js';
import { DataStorageClass } from '../DataStorage/DataStorageClass.js';
/* eslint-enable no-unused-vars */

import * as CommonHelpers from '../../common/CommonHelpers.js';
import { commonModal } from '../../common/CommonModal.js';
import { commonNotify } from '../../common/CommonNotify.js';

import * as ImportExportHelpers from './ImportExportHelpers.js';

export class ImportDataClass {
  /** @type {DataStorageClass} */
  dataStorage;

  /** @constructor
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    const { dataStorage } = params;
    this.dataStorage = dataStorage;
  }

  getUploadFileFormContent() {
    const content = `
<form class="InputForm" id="form">
  <div>
    <button
      class="FileUploadButton ActionButton FileUploadButtonXL FullWidth"
      id="fileButton"
    >
      <span id="spinner" class="fa fa-spinner fa-spin"></span>
      <span id="buttonText">
        Select or drag file to upload
      </span>
      <input
        id="fileInput"
        class="FileUploadInput"
        type="file"
        accept=".json"
        _hidden
      />
    </button>
  </div>
  <div class="Actions">
    <button
      class="ActionButton ThemePrimary"
      id="uploadButton"
      disabled
    >
      <i class="icon fa fa-check"></i>
      Upload
    </button>
    <button
      class="ActionButton ThemePrimary"
      id="cancelButton"
    >
      <i class="icon fa fa-times"></i>
      Cancel
    </button>
  </div>
</form>
  `;
    return content;
  }

  /** Show upload file modal */
  uploadFileModal() {
    const title = 'Select data file to upload';
    const content = this.getUploadFileFormContent();
    const modalId = 'upload-data-modal';
    return new Promise((resolve, reject) => {
      commonModal.ensureInit().then(() => {
        commonModal
          .setModalContentId(modalId)
          .setTitle(title)
          .setModalWindowOptions({
            autoHeight: true,
            width: 'md',
          })
          .setModalContentOptions({
            // Scrollings and paddings will be set for inner components particaluary.
            scrollable: true,
            padded: true,
          })
          .setContent(content)
          .onHide(reject)
          .showModal();
        /** Selected file to upload...
         * @type {File}
         */
        let selectedFile = undefined;
        const modalNode = document.getElementById(modalId);
        const formNode = /** @type {HTMLFormElement} */ (modalNode.querySelector('#form'));
        const fileButton = /** @type {HTMLButtonElement} */ (
          modalNode.querySelector('#fileButton')
        );
        const fileInput = /** @type {HTMLInputElement} */ (modalNode.querySelector('#fileInput'));
        const buttonText = /** @type {HTMLElement} */ (modalNode.querySelector('#buttonText'));
        const uploadButton = /** @type {HTMLButtonElement} */ (
          modalNode.querySelector('#uploadButton')
        );
        const cancelButton = /** @type {HTMLButtonElement} */ (
          modalNode.querySelector('#cancelButton')
        );
        fileInput.focus();
        /** @param {MouseEvent} event */
        function preventSubmit(event) {
          event.preventDefault();
          return false;
        }
        /** @param {File} file */
        function selectFile(file) {
          const { type, name, size } = file;
          if (!name.toLowerCase().endsWith('.json') || type !== 'application/json') {
            // Error...
            commonNotify.showError('Expected json data file!');
            return;
          }
          const sizeStr = CommonHelpers.getApproxSize(size, { normalize: true }).join('');
          const buttonStr = `File: ${name} (${sizeStr})`;
          /* console.log('[selectFile]', {
           *   buttonStr,
           *   type,
           *   name,
           *   size,
           *   sizeStr,
           *   file,
           * });
           */
          selectedFile = file;
          buttonText.innerText = buttonStr;
          uploadButton.removeAttribute('disabled');
        }
        /** @param {MouseEvent} event */
        function handleSelectedFile(event) {
          event.preventDefault();
          const target = /** @type {HTMLInputElement} */ (event.target);
          const files = target.files;
          const file = files && files[0];
          selectFile(file);
          return false;
        }
        /** @param {boolean} isLoading */
        function setLoading(isLoading) {
          fileButton.classList.toggle('Loading', !!isLoading);
        }
        /** @param {MouseEvent} event */
        function onUpload(event) {
          event.preventDefault();
          // handleSelectedFile
          loadDataFromFile()
            .then((data) => {
              resolve(data);
              commonModal.hideModal();
            })
            .catch(CommonHelpers.NOOP);
        }
        function loadDataFromFile() {
          const file = selectedFile;
          const { name } = file;
          // setLoaded(false);
          setLoading(true);
          return new Promise((resolve, reject) => {
            ImportExportHelpers.loadDataFile(file, {
              timeout: 5000,
              // onProgress: handleLoadingProgress,
            })
              .then(
                /** @param {TImportExportData} data */
                (data) => {
                  /* console.log('[ImportDataClass:loadDataFromFile] loadDataFile success', {
                   *   data,
                   *   name,
                   * });
                   */
                  commonNotify.showSuccess('File "' + name + '" successfully loaded!');
                  resolve(data);
                },
              )
              .catch(
                /** @param {Error} error */
                (error) => {
                  // eslint-disable-next-line no-console
                  console.error('[ImportDataClass:processError]', {
                    error,
                  });
                  debugger; // eslint-disable-line no-debugger
                  commonNotify.showError(error);
                  reject(error);
                },
              )
              .finally(() => {
                setLoading(false);
                // setLoadingProgress(undefined);
              });
          });
        }
        fileInput.addEventListener('change', handleSelectedFile);
        // fileButton.addEventListener('click', onFileButtonClick);
        formNode.addEventListener('submit', preventSubmit);
        uploadButton.addEventListener('click', onUpload);
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          commonModal.hideModal();
        });
      });
    });
  }

  importData() {
    this.uploadFileModal()
      .then(
        /** @param {TImportExportData} data */
        (data) => {
          const { projects } = data;
          this.dataStorage.setNewProjects(projects);
        },
      )
      .catch(CommonHelpers.NOOP);
  }
}
