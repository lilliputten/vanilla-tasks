// @ts-check

import * as AppConstants from './AppConstants.js';
import { commonNotify } from '../common/CommonNotify.js';
import { SimpleEvents } from '../common/SimpleEvents.js';
import { DataStorageClass } from './DataStorage/DataStorageClass.js';
import { ActiveTasksClass } from './ActiveTasks/ActiveTasksClass.js';
import { ProjectsListClass } from './ProjectsList/ProjectsListClass.js';
import { MainMenuClass } from './MainMenu/MainMenuClass.js';
import { FirebaseClass } from './Firebase/FirebaseClass.js';
import { GoogleAuthClass } from './GoogleAuth/GoogleAuthClass.js';
import { AppEventsClass } from './AppEventsClass.js';

/** Do we need to use a service worker? */
export class AppClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {SimpleEvents} */
  events;

  /** @type {Partial<TModules>} */
  modules = {};

  /** @type {ProjectsListClass} */
  processList;

  /** @type {BroadcastChannel} */
  swChannel;

  /** @constructor
   * @param {TSharedParams} sharedParams
   */
  constructor(sharedParams) {
    this.events = new SimpleEvents('App');

    /** @type {TCoreParams} */
    const coreParams = {
      ...sharedParams,
      events: this.events,
      modules: /** @type {TModules} */ (this.modules),
    };

    new DataStorageClass(coreParams);
    new ActiveTasksClass(coreParams);

    // Auth...
    new GoogleAuthClass(coreParams);

    // Main menu
    new MainMenuClass(coreParams);

    // Firebase
    new FirebaseClass(coreParams);

    new AppEventsClass(coreParams);

    // Processes list component
    this.processList = new ProjectsListClass(coreParams);

    // NOTE: SW temporarily disabled (for the demo time)
    window.addEventListener('load', this.registerSW.bind(this));

    /* // DEBUG: Check initialized modules
     * console.log('[AppClass] initialization finished', {
     *   modules,
     * });
     */
    this.events.emit('AppInited', coreParams);

    // TODO: Finish app initialization?
    this.appInited();
  }

  appInited() {}

  /** @param {MessageEvent} event */
  channelMessage(event) {
    const { data } = event;
    const { kind, versionStamp } = data;
    console.log('[AppClass:channelMessage]', {
      kind,
      versionStamp,
      data,
      event,
    });
    if (kind === 'versionUpdated') {
      commonNotify.showInfo(
        `The application version has been updated (to ${versionStamp}). It's highly recommended to reload the page.`,
      );
    }
  }

  // Register the Service Worker
  async registerSW() {
    if (AppConstants.useServiceWorker && 'serviceWorker' in navigator) {
      // commonNotify.showSuccess('Start serviceworker');
      try {
        await navigator.serviceWorker.register('serviceworker.js');
        // eslint-disable-next-line no-console
        console.log('SW registration succeed');
        this.swChannel = new BroadcastChannel('app');
        this.swChannel.postMessage({ kind: 'appInit' });
        this.swChannel.onmessage = this.channelMessage.bind(this);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SW registration failed', error);
        debugger; // eslint-disable-line no-debugger
      }
    }
  }
}
