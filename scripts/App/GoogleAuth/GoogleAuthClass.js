// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

/** Time to keep user signed (via cookie, secs) */
const keepSignedMaxAgeSecs = 60 * 60;

export class GoogleAuthClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  layoutNode;

  // UNUSED: Temporarily?
  /** @type {TAuthResponse['credential']} */
  credential;

  /** @type {TAuthResponse['clientId']} */
  clientId;

  /** @constructor
   * @param {TAppParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { layoutNode } = params;
    this.layoutNode = layoutNode;

    // Init handler callbacks...
    callbacks.renderSignInButton = this.renderSignInButton.bind(this);
    callbacks.onSignInSuccess = this.onSignInSuccess.bind(this);
    callbacks.onSignInFailure = this.onSignInFailure.bind(this);
    callbacks.onSignOut = this.onSignOut.bind(this);
    callbacks.onInit = this.onInit.bind(this);

    // Set global handler
    window.renderSignInButton = callbacks.renderSignInButton;
    window.onSignInSuccess = callbacks.onSignInSuccess;
    window.onSignInFailure = callbacks.onSignInFailure;

    window.addEventListener('load', callbacks.onInit);
  }

  // Actions...

  updateUserState() {
    const { clientId, credential } = this;
    const isSigned = this.isSigned();
    /* // It's possible to access global google accounts data... (TODO?)
     * // @ts-ignore
     * const accounts = window.google.accounts;
     * const {
     *   // @ts-ignore
     *   oauth2,
     *   id,
     * } = accounts;
     */
    console.log('[GoogleAuthClass:updateUserState]', {
      isSigned,
      clientId,
      credential,
      // id,
      // oauth2,
      // accounts,
    });
    // Update cookie and document state...
    CommonHelpers.setCookie('clientId', isSigned ? clientId : '', keepSignedMaxAgeSecs);
    CommonHelpers.setCookie('credential', isSigned ? credential : '', keepSignedMaxAgeSecs);
    document.body.classList.toggle('Signed', isSigned);
    // TODO: Invoke events onSignIn, onSignOut?
  }

  isSigned() {
    const {
      // clientId,
      credential,
    } = this;
    const isSigned = !!credential;
    return isSigned;
  }

  // Actions...

  onSignOut() {
    this.clientId = undefined;
    this.credential = undefined;
    console.log('[GoogleAuthClass:onSignOut]');
    this.updateUserState();
  }

  onInit() {
    const clientId = CommonHelpers.getCookie('clientId');
    const credential = CommonHelpers.getCookie('credential');
    this.clientId = clientId && clientId !== 'undefined' ? clientId : undefined;
    this.credential = credential && credential !== 'undefined' ? credential : undefined;
    console.log('[GoogleAuthClass:onInit]', {
      clientId,
      credential,
    });
    this.updateUserState();
  }

  /** @param {TAuthResponse} response */
  onSignInSuccess(response) {
    const { error, clientId, credential } = response;
    console.log('[GoogleAuthClass:onSignInSuccess]', {
      error,
      clientId,
      credential,
    });
    if (error) {
      return this.onSignInFailure(error);
    }
    this.clientId = clientId;
    this.credential = credential;
    this.updateUserState();
    this.fetchUserProfile();
  }

  /* @param {Error | { error: string }} error */
  /** @param {TAuthResponse['error']} error */
  onSignInFailure(error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : error.error;
    // eslint-disable-next-line no-console
    console.error('[GoogleAuthClass:onSignInFailure]', message, {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    commonNotify.showError('Sign-In error ' + message);
    this.onSignOut();
    // this.clientId = undefined;
    // this.credential = undefined;
    // this.updateUserState();
  }

  fetchUserProfile() {
    const { credential } = this;
    // Use the access token to retrieve user profile data
    return fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: {
        Authorization: `Bearer ${credential}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Extract the desired user profile information (e.g., name, email)
        console.log('User profile:', data);
        debugger;
        // Use the information as needed (e.g., display on your website, store securely)
        return data;
      })
      .catch((error) => {
        // Handle errors during profile data retrieval
        console.error('Error fetching user profile:', error);
        debugger;
      });
  }

  // UNUSED: For old gauth api
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
