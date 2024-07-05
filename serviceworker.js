/* eslint-env worker */
// @ts-check
/// <reference path="scripts/@types/shared/serviceworker.d.ts"/>

const staticCacheName = 'vanilla-tasks';

/** @param {InstallEvent} event */
function swInstall(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(['/']);
    }),
  );
}

/** @param {FetchEvent} event */
function swFetch(event) {
  // eslint-disable-next-line no-console
  console.log('[serviceworker:fetch]', event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }),
  );
}

/** A mock event handler type to calm tsserver checker.
 * @typedef {(ev: Event) => void} TGenericEventHandler
 */

self.addEventListener('install', /** @type {TGenericEventHandler} */ (swInstall));
self.addEventListener('fetch', /** @type {TGenericEventHandler} */ (swFetch));
