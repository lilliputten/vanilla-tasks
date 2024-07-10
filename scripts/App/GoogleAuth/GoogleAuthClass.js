// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';
import * as CommonHelpers from '../../common/CommonHelpers.js';

/** Time to keep user signed (via cookie, secs) */
const keepSignedMaxAgeSecs = 48 * 60 * 60; // 2d

const defaultUserIconImage = '/images/icons/user-empty.png';

export class GoogleAuthClass {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {HTMLElement} */
  layoutNode;

  /** @type {HTMLButtonElement} */
  userButtonNode;
  /** @type {HTMLElement} */
  userIconNode;
  /** @type {HTMLElement} */
  userNameNode;

  // UNUSED: Temporarily?
  /** @type {TAuthResponse['credential']} */
  credential;

  // [>* @type {TAuthResponse['clientId']} <]
  // clientId;

  /** @type {TTokenInfoData['name']} */
  userName;
  /** @type {TTokenInfoData['email']} */
  userEmail;
  /** @type {TTokenInfoData['picture']} */
  userPicture;

  /** @constructor
   * @param {TAppParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { layoutNode } = params;
    this.layoutNode = layoutNode;

    // Init handler callbacks...
    callbacks.onSignInSuccess = this.onSignInSuccess.bind(this);
    callbacks.onSignInFailure = this.onSignInFailure.bind(this);
    callbacks.onSignOut = this.onSignOut.bind(this);
    callbacks.onInit = this.onInit.bind(this);

    // Set global handler
    window.onSignInSuccess = callbacks.onSignInSuccess;
    window.onSignInFailure = callbacks.onSignInFailure;

    window.addEventListener('load', callbacks.onInit);

    // Prepare user button nodes...
    this.userButtonNode = /** @type {HTMLButtonElement} */ (document.getElementById('UserButton'));
    this.userNameNode = this.userButtonNode.querySelector('.UserName');
    this.userIconNode = this.userButtonNode.querySelector('.UserIcon');
  }

  // Actions...

  updateUserState() {
    const {
      // clientId,
      credential,
      userButtonNode,
      userNameNode,
      userIconNode,
      userName,
      userEmail,
      userPicture,
    } = this;
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
      // clientId,
      credential,
      // id,
      // oauth2,
      // accounts,
    });
    // Update cookie and document state...
    // CommonHelpers.setCookie('clientId', isSigned ? clientId : '', keepSignedMaxAgeSecs);
    CommonHelpers.setCookie('credential', isSigned ? credential : '', keepSignedMaxAgeSecs);
    document.body.classList.toggle('Signed', isSigned);
    // Update user button...
    userIconNode.style.backgroundImage = `url("${userPicture || defaultUserIconImage}")`;
    userNameNode.innerHTML = CommonHelpers.quoteHtmlAttr(userName || 'Unknown user');
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
    // this.clientId = undefined;
    this.credential = undefined;
    this.userName = undefined;
    this.userEmail = undefined;
    this.userPicture = undefined;
    console.log('[GoogleAuthClass:onSignOut]');
    this.updateUserState();
  }

  onInit() {
    // const clientId = CommonHelpers.getCookie('clientId');
    const credential = CommonHelpers.getCookie('credential');
    // this.clientId = clientId && clientId !== 'undefined' ? clientId : undefined;
    this.credential = credential && credential !== 'undefined' ? credential : undefined;
    console.log('[GoogleAuthClass:onInit]', {
      // clientId,
      credential,
    });
    this.updateUserState();
    this.fetchUserDetails();
  }

  /** @param {TAuthResponse} response */
  onSignInSuccess(response) {
    const {
      error,
      // clientId,
      credential,
    } = response;
    console.log('[GoogleAuthClass:onSignInSuccess]', {
      error,
      // clientId,
      credential,
      response,
    });
    if (error) {
      return this.onSignInFailure(error);
    }
    // this.clientId = clientId;
    this.credential = credential;
    this.updateUserState();
    this.fetchUserDetails();
  }

  /* @param {Error | { error: string }} error */
  /** @param {TAuthResponse['error']} error */
  onSignInFailure(error) {
    const message = CommonHelpers.getAuthErrorMessage(error);
    // eslint-disable-next-line no-console
    console.error('[GoogleAuthClass:onSignInFailure]', message, {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    commonNotify.showError('Sign-In error ' + message);
    this.onSignOut();
  }

  fetchUserDetails() {
    const {
      credential,
      // clientId,
    } = this;
    if (!credential) {
      return Promise.resolve();
    }
    // Use the access token to retrieve user profile data
    // const url = 'https://www.googleapis.com/plus/v1/people/me';
    // const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
    // const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`;
    const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`;
    // const url = `https://www.googleapis.com/oauth2/v3/userinfo`;
    return fetch(url, {
      credentials: 'same-origin',
      // credentials: 'include', // NOTE: Expecting `Access-Control-Allow-Credential` response header
      // headers: {
      //   Authorization: `Bearer ${credential}`,
      // },
    })
      .then((response) => response.json())
      .then(
        /** @param {TTokenInfoData} data */
        (data) => {
          const {
            // prettier-ignore
            error,
            name,
            email,
            picture,
            exp: expSec,
          } = data;
          if (error) {
            throw error;
          }
          // Extract the desired user profile information (e.g., name, email)
          console.log('[GoogleAuthClass:fetchUserDetails] Got user profile', {
            error,
            name,
            email,
            picture,
            expSec,
            data,
          });
          // Use the information as needed (e.g., display on your website, store securely)
          this.userName = name;
          this.userEmail = email;
          this.userPicture = picture;
          this.updateUserState();
          return data;
        },
      )
      .catch((error) => {
        const message = CommonHelpers.getAuthErrorMessage(error);
        // eslint-disable-next-line no-console
        console.error('[GoogleAuthClass:fetchUserDetails]', message, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        this.onSignOut();
      });
  }
}
