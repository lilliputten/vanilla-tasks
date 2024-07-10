// @ts-check

import { ExportDataClass } from '../ImportExport/ExportDataClass.js';
import { ImportDataClass } from '../ImportExport/ImportDataClass.js';

import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

export class MainMenuClass {
  /** @type {TMainMenuParams['dataStorage']} */
  dataStorage;

  /** @type {TMainMenuParams['googleAuth']} */
  googleAuth;

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

  /** @type {HTMLButtonElement} */
  installButton;

  /** @type {BeforeInstallPromptEvent} */
  installEvent;

  /** @constructor
   * @param {TMainMenuParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { dataStorage, googleAuth } = params;
    this.dataStorage = dataStorage;
    this.googleAuth = googleAuth;

    this.exportData = new ExportDataClass(params);
    this.importData = new ImportDataClass(params);

    this.initDomNodes();

    // Init handler callbacks...
    callbacks.onMainMenuToggle = this.onMainMenuToggle.bind(this);
    callbacks.onDataExport = this.onDataExport.bind(this);
    callbacks.onDataImport = this.onDataImport.bind(this);
    callbacks.onInstallButtonClick = this.onInstallButtonClick.bind(this);
    callbacks.onInstallDone = this.onInstallDone.bind(this);
    callbacks.onBeforeInstallPromptEvent = this.onBeforeInstallPromptEvent.bind(this);
    callbacks.onSignOut = this.onSignOut.bind(this);
    callbacks.onUserDropdownMenuToggle = this.onUserDropdownMenuToggle.bind(this);

    this.initPWAInstall();

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

    this.installButton = headerNode.querySelector('#PWAInstallButton');
  }

  initPWAInstall() {
    const { callbacks } = this;
    // const useInstall = true && !AppConstants.isLocal;
    // const hasInstallFeatures = 'BeforeInstallPromptEvent' in window;
    // if ([> !useInstall || <] !hasInstallFeatures) {
    //   // return;
    // }
    /** @type {BeforeInstallPromptEvent} */
    /*
     * console.log('[MainMenuClass:initPWAInstall]', {
     *   installEvent: this.installEvent,
     *   installButton: this.installButton,
     *   // hasInstallFeatures,
     * });
     */
    // Show the button...
    // Add event handlers...
    window.addEventListener('beforeinstallprompt', callbacks.onBeforeInstallPromptEvent);
    window.addEventListener('appinstalled', callbacks.onInstallDone);
  }

  // Actions...

  onUserDropdownMenuToggle() {
    const userDropdownMenu = document.getElementById('UserDropdownMenu');
    console.log('[MainMenuClass:onUserDropdownMenuToggle]', {
      userDropdownMenu,
    });
    userDropdownMenu.classList.toggle('Show');
  }

  /** @param {MouseEvent} event */
  onSignOut(event) {
    const { googleAuth } = this;
    event.preventDefault();
    console.log('[MainMenuClass:onSignOut]');
    googleAuth.onSignOut();
  }

  /** @param {BeforeInstallPromptEvent} event */
  onBeforeInstallPromptEvent(event) {
    event.preventDefault();
    // console.log('[MainMenuClass:onBeforeInstallPromptEvent]');
    // commonNotify.showSuccess('Before install prompt event (beforeinstallprompt) has been called');
    this.installEvent = event;
    if (this.installButton) {
      this.installButton.disabled = false;
      this.installButton.classList.toggle('hidden', false);
    }
  }

  onInstallDone() {
    // console.log('[MainMenuClass:onInstallDone]');
    if (this.installButton) {
      this.installButton.disabled = true;
    }
    this.installEvent = undefined;
    commonNotify.showSuccess('The application has been already installed');
  }

  async onInstallButtonClick() {
    // console.log('[MainMenuClass:onInstallButtonClick]');
    const logEvent = this.installEvent ? 'event' : 'empty';
    if (!this.installEvent) {
      commonNotify.showError('No installation event (beforeinstallprompt) has been provided');
      return;
    }
    commonNotify.showSuccess(`Installing the application (${logEvent})...`);
    this.installEvent.prompt();
    const result = await this.installEvent.userChoice;
    if (result.outcome === 'accepted') {
      this.onInstallDone();
    }
  }

  onDataExport() {
    this.exportData.exportData();
  }

  onDataImport() {
    this.importData.importData();
  }

  onMainMenuToggle() {
    const { headerNode } = this;
    headerNode.classList.toggle('MenuOpen');
  }
}
