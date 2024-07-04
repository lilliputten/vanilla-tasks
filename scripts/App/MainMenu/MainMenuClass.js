// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

export class MainMenuClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  headerNode;

  /** @constructor
   * @param {TSharedParams} _sharedParams
   */
  constructor(_sharedParams) {
    const { callbacks } = this;

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
    const { headerNode } = this;
    // eslint-disable-next-line no-console
    console.log('[MainMenuClass:onDataExport]', {
      headerNode,
    });
    // TODO!
  }

  onDataImport() {
    const { headerNode } = this;
    // eslint-disable-next-line no-console
    console.log('[MainMenuClass:onDataImport]', {
      headerNode,
    });
    // TODO!
  }

  onMainMenuToggle() {
    const { headerNode } = this;
    headerNode.classList.toggle('MenuOpen');
  }
}
