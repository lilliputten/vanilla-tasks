// @ts-check

import { ExportDataClass } from '../ImportExport/ExportDataClass.js';
import { ImportDataClass } from '../ImportExport/ImportDataClass.js';

import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

export class MainMenuClass {
  /** @type {TModules} modules */
  modules;

  /** @type {TCoreParams['events']} */
  events;

  /** @type {TModules['googleAuth']} */
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
   * @param {TCoreParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { modules, events } = params;

    this.events = events;
    this.modules = modules;

    modules.mainMenu = this;

    this.exportData = new ExportDataClass(params);
    this.importData = new ImportDataClass(params);

    // Init handler callbacks...
    callbacks.onMainMenuToggle = this.onMainMenuToggle.bind(this);
    callbacks.onDataClear = this.onDataClear.bind(this);
    callbacks.onDataExport = this.onDataExport.bind(this);
    callbacks.onDataImport = this.onDataImport.bind(this);
    callbacks.onInstallButtonClick = this.onInstallButtonClick.bind(this);
    callbacks.onInstallDone = this.onInstallDone.bind(this);
    callbacks.onBeforeInstallPromptEvent = this.onBeforeInstallPromptEvent.bind(this);
    callbacks.onSignOut = this.onSignOut.bind(this);
    callbacks.onUserDropdownMenuToggle = this.onUserDropdownMenuToggle.bind(this);
    callbacks.onDataDropdownMenuToggle = this.onDataDropdownMenuToggle.bind(this);
    callbacks.onDocumentClick = this.onDocumentClick.bind(this);

    this.initDomNodes();

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

    // Hide any dropdowns on any click (TODO: To do it if clicked outside the menu)
    // document.body.addEventListener('mousedown', this.callbacks.onDocumentClick);
  }

  initPWAInstall() {
    const { callbacks } = this;
    // // TODO!
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

  /** @param {string[]} [exclude] */
  closeAllDropdownMenus(exclude) {
    const { headerNode } = this;
    const menus = headerNode.querySelectorAll('.DropdownMenu');
    menus.forEach((node) => {
      if (!exclude || !exclude.includes(node.id)) {
        node.classList.toggle('Show', false);
      }
    });
  }

  onDocumentClick() {
    this.closeAllDropdownMenus();
  }

  // Actions...

  onUserDropdownMenuToggle() {
    const userDropdownMenu = document.getElementById('UserDropdownMenu');
    /* console.log('[MainMenuClass:onUserDropdownMenuToggle]', {
     *   userDropdownMenu,
     * });
     */
    this.closeAllDropdownMenus(['UserDropdownMenu']);
    userDropdownMenu.classList.toggle('Show');
  }

  onDataDropdownMenuToggle() {
    const dataDropdownMenu = document.getElementById('DataDropdownMenu');
    /* console.log('[MainMenuClass:onDataDropdownMenuToggle]', {
     *   dataDropdownMenu,
     * });
     */
    this.closeAllDropdownMenus(['DataDropdownMenu']);
    dataDropdownMenu.classList.toggle('Show');
  }

  /** @param {MouseEvent} event */
  onSignOut(event) {
    const { googleAuth } = this.modules;
    event.preventDefault();
    // console.log('[MainMenuClass:onSignOut]');
    this.closeAllDropdownMenus();
    googleAuth.onSignOut();
  }

  /** @param {BeforeInstallPromptEvent} event */
  onBeforeInstallPromptEvent(event) {
    event.preventDefault();
    console.log('[MainMenuClass:onBeforeInstallPromptEvent]');
    // commonNotify.showSuccess('Before install prompt event (beforeinstallprompt) has been called');
    this.installEvent = event;
    if (this.installButton) {
      this.installButton.disabled = false;
      this.installButton.classList.toggle('hidden', false);
    }
  }

  onInstallDone() {
    console.log('[MainMenuClass:onInstallDone]');
    if (this.installButton) {
      this.installButton.disabled = true;
    }
    this.installEvent = undefined;
    commonNotify.showSuccess('The application has been already installed');
  }

  async onInstallButtonClick() {
    this.closeAllDropdownMenus();
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

  onDataClear() {
    this.closeAllDropdownMenus();
    const { modules } = this;
    const { dataStorage } = modules;
    dataStorage.clearAllData();
  }

  onDataExport() {
    this.closeAllDropdownMenus();
    this.exportData.exportData();
  }

  onDataImport() {
    this.closeAllDropdownMenus();
    this.importData.importData();
  }

  onMainMenuToggle() {
    const { headerNode } = this;
    headerNode.classList.toggle('MenuOpen');
  }
}
