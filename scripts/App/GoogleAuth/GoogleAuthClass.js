// @ts-check

// Import types only...
/* eslint-disable no-unused-vars */
// import { SimpleEvents } from '../../common/SimpleEvents.js';
import { DataStorageClass } from '../DataStorage/DataStorageClass.js';
/* eslint-enable no-unused-vars */

// import * as AppConstants from '../AppConstants.js';

import { ExportDataClass } from '../ImportExport/ExportDataClass.js';
import { ImportDataClass } from '../ImportExport/ImportDataClass.js';

import { commonNotify } from '../../common/CommonNotify.js';

import * as AppHelpers from '../AppHelpers.js';

export class GoogleAuthClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  layoutNode;

  /** @constructor
   * @param {TProjectsListClassParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { layoutNode } = params;
    this.layoutNode = layoutNode;

    // Init handler callbacks...
    callbacks.renderSignInButton = this.renderSignInButton.bind(this);
    callbacks.onSignInSuccess = this.onSignInSuccess.bind(this);
    callbacks.onSignInFailure = this.onSignInFailure.bind(this);

    // Set global handler
    window.renderSignInButton = callbacks.renderSignInButton;
    window.onSignInSuccess = callbacks.onSignInSuccess;

    /* // DEBUG
     * const gapi = window.gapi;
     * // @see https://developers.google.com/identity/sign-in/web/reference
     * gapi.load('auth2', () => {
     *   console.log('[GoogleAuthClass] load', {
     *     load: gapi.load,
     *     gapi,
     *   });
     *   // debugger;
     * });
     */
  }

  // Actions...

  /** @param {any} googleUser */
  onSignInSuccess(googleUser) {
    // @ts-ignore: Specify the types
    const profile = googleUser && googleUser.getBasicProfile();
    const name = profile && profile.getName();
    console.log('[GoogleAuthClass:onSignInSuccess]', {
      profile,
      name,
      googleUser,
    });
    debugger;
  }

  /** @param {Error | { error: string }} error */
  onSignInFailure(error) {
    const message = error instanceof Error ? error.message : error.error;
    // eslint-disable-next-line no-console
    console.error('[GoogleAuthClass:onSignInFailure]', message, {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    commonNotify.showError('Sign-In error ' + message);
  }

  renderSignInButton() {
    const { callbacks } = this;
    console.log('[GoogleAuthClass:renderSignInButton]');
    debugger;
    // @ts-ignore: Unknown type for signin2 (TODO?)
    window.gapi.signin2.render('GapiSignInButton', {
      scope: 'profile email',
      // width: 240,
      // height: 50,
      longtitle: false,
      theme: 'dark', // dark, blue, light_blue
      onsuccess: callbacks.onSignInSuccess,
      onfailure: callbacks.onSignInFailure,
    });
  }
}
