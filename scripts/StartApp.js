// @ts-check

import { useDebug } from './common/CommonConstants.js';
import { commonNotify } from './common/CommonNotify.js';

export class StartApp {
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

    console.log('[StartApp] Ok', {
      useDebug,
      layoutNode,
      callbacks,
    });

    // commonNotify.showSuccess('Test');
  }
}
