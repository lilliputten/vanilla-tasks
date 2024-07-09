// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

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
    window.onSignInFailure = callbacks.onSignInFailure;

    window.addEventListener('load', () => {
      // @ts-ignore
      const accounts = window.google?.accounts || {};
      const { oauth2, id } = accounts;
      console.log('[GoogleAuthClass]', {
        id,
        oauth2,
        accounts,
      });
      // debugger;
    });

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

  /** @param {any} response */
  onSignInSuccess(response) {
    const { clientId, credential } = response;
    // // Old (platform/gapi) api examples:
    // const profile = response?.getBasicProfile?.();
    // const name = profile?.getName?.();
    // @ts-ignore
    const accounts = window.google?.accounts || {};
    const { oauth2, id } = accounts;
    console.log('[GoogleAuthClass:onSignInSuccess]', {
      id,
      oauth2,
      accounts,
      clientId,
      credential,
      // profile,
      // name,
      // response,
    });
    debugger;
    // TODO: Update has logged infi, store recent user id for next page
    // reload/visit, create a method to check if the recent user is actual and
    // to revoke (sign-out) it.
    /* // DEBUG: Try to fetch user details (name, at least)
     * // @see https://any-api.com/googleapis_com/oauth2/docs/userinfo/oauth2_userinfo_v2_me_get
     * // Use the access token to retrieve user profile data
     * // const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${credential}`
     * // const url = `https://www.googleapis.com/userinfo/v2/me?alt=json&key=AIzaSyAJhaviSy9wwIv1dpsO2gEJGB_nO0QATD8&oauth_token=${credential}`;
     * // const url = `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&key=AIzaSyAJhaviSy9wwIv1dpsO2gEJGB_nO0QATD8&oauth_token=${credential}`;
     * const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
     * // const url = 'https://www.googleapis.com/userinfo/v2/me
     * fetch(url, {
     *   headers: {
     *     Authorization: `Bearer ${credential}`,
     *     Accept: 'application/json',
     *     'Content-Type': 'application/json',
     *   },
     * })
     *   .then((response) => response.json())
     *   .then((data) => {
     *     const { error } = data;
     *     if (error) {
     *       throw error;
     *     }
     *     // Extract the desired user profile information (e.g., name, email)
     *     console.log('[GoogleAuthClass:onSignInSuccess] User profile:', data);
     *     debugger;
     *     // Use the information as needed (e.g., display on your website, store securely)
     *   })
     *   .catch((error) => {
     *     const message = error?.message || String(error);
     *     // eslint-disable-next-line no-console
     *     console.error('[GoogleAuthClass:onSignInSuccess:fetch]', message, {
     *       error,
     *     });
     *     debugger; // eslint-disable-line no-debugger
     *     commonNotify.showError(message);
     *   });
     */
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
