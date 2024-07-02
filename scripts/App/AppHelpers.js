// @ts-check

import * as CommonHelpers from '../common/CommonHelpers.js';
import { commonModal } from '../common/CommonModal.js';

// All possible action ids for `updateActionHandlers` (TODO: Move to constants)
const actionTypes = ['click', 'change'];

/**
 * @param {TTask[]} tasks
 * @return number
 */
export function getCompletedTasksCount(tasks) {
  if (!Array.isArray(tasks) || !tasks.length) {
    return 0;
  }
  const completedTasks = tasks.filter(({ completed }) => !!completed);
  return completedTasks.length;
}

/** Returns string '{completedTasksCount}/{totalTasksCount}'
 * @param {TTask[]} tasks
 * @return string
 */
export function getTasksStatsStr(tasks) {
  if (!Array.isArray(tasks) || !tasks.length) {
    return '';
  }
  const totalTasksCount = tasks.length;
  const completedTasksCount = getCompletedTasksCount(tasks);
  return [completedTasksCount, totalTasksCount].join('/');
}

/** Edit project name modal
 * @param {string} id - Input id
 * @param {string} paramName - Parameter name
 * @param {string} name - Current name
 */
function getEditTextValueFormContent(id, paramName, name) {
  const quotedName = CommonHelpers.quoteHtmlAttr(name); // .replace(/"/g, '&quot;');
  const content = `
<form class="InputForm" id="form" form-id="${id}">
  <div>
    <input class="InputText FullWidth" value="${quotedName}" placeholder="${paramName}" id="textInput" />
  </div>
  <div class="Actions">
    <button
      class="ActionButton ThemePrimary"
      id="onSaveAction"
    >
      <i class="icon fa fa-check"></i>
      Save
    </button>
    <button
      class="ActionButton ThemePrimary"
      id="onCancelAction"
    >
      <i class="icon fa fa-times"></i>
      Cancel
    </button>
  </div>
</form>
  `;
  return content;
}

/** Edit project name modal
 * @param {string} id - Input id
 * @param {string} title - dialogTitle
 * @param {string} paramName - Parameter name
 * @param {string} value - Current value
 */
export function editTextValueModal(id, title, paramName, value) {
  const content = getEditTextValueFormContent(id, paramName, value);
  const modalId = 'edit-' + id + '-modal';
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
      const modalNode = document.getElementById(modalId);
      const formNode = /** @type {HTMLFormElement} */ (modalNode.querySelector('#form'));
      const textInput = /** @type {HTMLInputElement} */ (modalNode.querySelector('#textInput'));
      const saveButton = /** @type {HTMLButtonElement} */ (
        modalNode.querySelector('#onSaveAction')
      );
      const cancelButton = /** @type {HTMLButtonElement} */ (
        modalNode.querySelector('#onCancelAction')
      );
      textInput.focus();
      /** @param {MouseEvent} event */
      function onSaveAction(event) {
        event.preventDefault();
        const value = textInput.value;
        resolve(value);
        commonModal.hideModal();
      }
      formNode.addEventListener('submit', onSaveAction);
      saveButton.addEventListener('click', onSaveAction);
      cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        commonModal.hideModal();
      });
    });
  });
}

/** Confirmation form
 * @param {string} id - Input id
 * @param {string} _title - Dialog title
 */
function getConfirmationFormContent(id, _title, text) {
  const textBlock = text ? `<div class="Text">${text}</div>` : '';
  const content = `
<form class="InputForm" id="form" form-id="${id}">
  ${textBlock}
  <div class="Actions">
    <button
      class="ActionButton ThemePrimary"
      id="onYesAction"
    >
      <span class="icon fa fa-check"></span>
      Yes
    </button>
    <button
      class="ActionButton ThemePrimary"
      id="onCancelAction"
    >
      <span class="icon fa fa-times"></span>
      Cancel
    </button>
  </div>
</form>
  `;
  return content;
}

/** Edit project name modal
 * @param {string} id - Confirmation id
 * @param {string} title - Title
 * @param {string} text - Extra text
 */
export function confirmationModal(id, title, text) {
  const content = getConfirmationFormContent(id, title, text);
  const modalId = 'confirm-' + id + '-modal';
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
      const modalNode = document.getElementById(modalId);
      const formNode = /** @type {HTMLFormElement} */ (modalNode.querySelector('#form'));
      const yesButton = /** @type {HTMLButtonElement} */ (modalNode.querySelector('#onYesAction'));
      const cancelButton = /** @type {HTMLButtonElement} */ (
        modalNode.querySelector('#onCancelAction')
      );
      /** @param {MouseEvent} event */
      function onYesAction(event) {
        event.preventDefault();
        resolve(true);
        commonModal.hideModal();
      }
      formNode.addEventListener('submit', onYesAction);
      yesButton.addEventListener('click', onYesAction);
      cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        commonModal.hideModal();
      });
    });
  });
}

/**
 * @param {HTMLElement} parentNode
 * @param {TSharedHandlers} callbacks;
 */
export function updateActionHandlers(parentNode, callbacks) {
  const selectors = actionTypes.map((id) => `[${id}-action-id]`).join(', ');
  const actionNodes = Array.from(parentNode.querySelectorAll(selectors));
  if (parentNode.getAttribute('action-id')) {
    actionNodes.unshift(parentNode);
  }
  actionNodes.forEach((actionNode) => {
    // const foundActions = [];
    actionTypes.forEach((actionType) => {
      const actionId = actionNode.getAttribute(actionType + '-action-id');
      if (!actionId) {
        // Do nothing
        return;
      }
      const action = actionId && callbacks[actionId];
      if (!action) {
        const error = new Error(`Not found action for id "${actionId}"`);
        // eslint-disable-next-line no-console
        console.warn('[ProjectsListHelpers:updateActionHandlers]', error, {
          actionNode,
          parentNode,
        });
        return;
      }
      // Just for case: remove previous listener
      actionNode.removeEventListener(actionType, action);
      // Add listener...
      actionNode.addEventListener(actionType, action);
    });
  });
}
