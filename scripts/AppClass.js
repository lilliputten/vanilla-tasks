// @ts-check

import { useDebug } from './common/CommonConstants.js';
// import { commonNotify } from './common/CommonNotify.js';
// import { commonModal } from './common/CommonModal.js';

export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    // Will be initialized in `handlers` instance...
    const { callbacks } = this;

    const { layoutNode } = sharedParams;

    // eslint-disable-next-line no-console
    console.log('[AppClass] Ok', {
      useDebug,
      layoutNode,
      callbacks,
    });

    /* // DEMO: Test common modal
     * this.testModal();
     */

    // commonNotify.showSuccess('Test');
  }

  /* // DEMO: Test common modal
   * testModal() {
   *   const previewContent = `
   *     <h4>Test modal title</h4>
   *     <p>Test modal content</p>
   *   `;
   *   commonModal.ensureInit().then(() => {
   *     commonModal
   *       .setModalContentId('show-allocation-result')
   *       .setTitle('Test modal')
   *       .setModalWindowOptions({
   *         // autoHeight: true,
   *         width: 'md',
   *       })
   *       .setModalContentOptions({
   *         // Scrollings and paddings will be set for inner components particaluary.
   *         scrollable: true,
   *         padded: true,
   *       })
   *       .setContent(previewContent)
   *       .onHide(() => {
   *         // ...
   *       })
   *       .showModal();
   *   });
   * }
   */
}
