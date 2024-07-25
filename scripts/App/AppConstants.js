// @ts-check

import * as CommonConstants from '../common/CommonConstants.js';

export const projectsStorageId = 'projects';
export const currentProjectIdStorageId = 'currentProjectId';

export const isLocal = window.location.host.startsWith('localhost');

/** @type {TTaskStatus} */
export const defaultTaskStatus = 'pending';

export const useGoogleAuth = !CommonConstants.isDev;

/** Time to keep user signed (via cookie, secs) */
export const keepSignedMaxAgeSecs = 48 * 60 * 60; // 2d

export const defaultUserIconImage = '/images/icons/user-empty.png';

export const authScriptUrl = 'https://accounts.google.com/gsi/client';

export const useServiceWorker = true || !isLocal;
