/* eslint-env worker */
/// <reference path="scripts/@types/shared/serviceworker.d.ts"/>
// @ts-check
// @changed 2024.07.25, 18:18

const changed = `
@changed 2024.07.25, 18:18
`
  .trim()
  .replace('@changed ', '');

const staticCacheName = 'vanilla-tasks';

/** TAppInfo -- The type of `app-info.json` file
 * @typedef {object} TAppInfo
 * @property {string} version
 * @property {string} timestamp
 */

/** @type {string | undefined} */
let currentVersionStamp = undefined;

const swChannel = new BroadcastChannel('app');

if (swChannel) {
  swChannel.onmessage =
    /** @param {MessageEvent} event */
    (event) => {
      const { data } = event;
      const { kind } = data;
      console.log('[serviceworker:onmessage]', {
        kind,
        data,
        event,
      });
      if (kind === 'appInit') {
        fetchAppInfo();
      }
    };
  swChannel.postMessage({ kind: 'swInit' });
}

/** @param {TAppInfo | undefined} appInfo
 * @return {string | undefined}
 */
function getVersionStamp(appInfo) {
  if (!appInfo) {
    return undefined;
  }
  const { version, timestamp } = appInfo;
  const versionStamp = [version, timestamp].filter(Boolean).join(' / ');
  return versionStamp;
}

/** @type {Promise | undefined} */
let fetchingAppInfoNow = undefined;

function fetchAppInfo() {
  if (fetchingAppInfoNow) {
    return fetchingAppInfoNow;
  }
  const appInfoUrl = '/scripts/app-info.json';
  const req = new Request(appInfoUrl, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      pragma: 'no-cache',
    }),
  });
  console.log('[serviceworker:fetchAppInfo] start', {
    appInfoUrl,
    req,
    changed,
    currentVersionStamp,
    caches,
  });
  /* [>* @type {Response} <]
   * let currentRes;
   */
  const fetchOpts = {
    cache: 'no-cache',
  };
  fetchingAppInfoNow = Promise.all([
    // prettier-ignore
    fetch(req, fetchOpts),
    // caches.match(req),
  ])
    .then(
      ([
        // prettier-ignore
        fetchRes,
        // cacheRes,
      ]) => {
        console.log('[serviceworker:fetchAppInfo] then', {
          fetchRes,
          // cacheRes,
          req,
          caches,
        });
        // currentRes = fetchRes;
        return Promise.all([
          // prettier-ignore
          fetchRes.clone().json(),
          // cacheRes?.json(),
        ]);
      },
    )
    .then(
      /** @param {TAppInfo[]} appInfos */
      (appInfos) => {
        const [
          fetchData,
          // cacheData,
        ] = appInfos;
        const versionStamp = getVersionStamp(fetchData);
        // const cacheStamp = getVersionStamp(cacheData);
        // const hasCacheUpdated = !!cacheStamp && cacheStamp !== versionStamp;
        const isNewVersion = !!currentVersionStamp && currentVersionStamp !== versionStamp;
        const isVersionUpdated = !currentVersionStamp || currentVersionStamp !== versionStamp;
        // const hasOutdated = !cacheStamp || hasCacheUpdated;
        console.log('[serviceworker:fetchAppInfo] done', {
          isNewVersion,
          isVersionUpdated,
          // hasOutdated,
          versionStamp,
          currentVersionStamp,
          // cacheStamp,
          // cacheData,
          fetchData,
          // swCache,
          caches,
        });
        if (isVersionUpdated) {
          // Invalidate cache
          if (isNewVersion && swChannel) {
            swChannel.postMessage({ kind: 'versionUpdated', versionStamp });
          }
          caches.delete(staticCacheName);
          currentVersionStamp = versionStamp;
        }
        /* // Invalidate cache if ti's initialized and has another version stamp
         * if (hasOutdated) {
         *   caches.open(staticCacheName).then((cache) => {
         *     console.log('[serviceworker:fetchAppInfo] cache', {
         *       cache,
         *       versionStamp,
         *     });
         *     debugger;
         *     cache.put(req, currentRes);
         *   });
         * }
         */
        return fetchData;
      },
    )
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[serviceworker:fetchAppInfo]', error);
      debugger; // eslint-disable-line no-debugger
    })
    .finally(() => {
      fetchingAppInfoNow = undefined;
    });
  return fetchingAppInfoNow;
}

/** @param {InstallEvent} event */
function swInstall(event) {
  // eslint-disable-next-line no-console
  console.log('[serviceworker:swInstall]', {
    event,
    changed,
    currentVersionStamp,
  });
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      // swCache = cache;
      return cache.addAll(['/']);
    }),
  );
}

/** @param {FetchEvent} event */
function swFetch(event) {
  const { request } = event;
  const { url } = request;
  // eslint-disable-next-line no-console
  // console.log('[serviceworker:swFetch]', url);
  event.respondWith(
    caches.match(request).then((res) => {
      if (res) {
        const nonCacheableUrl =
          url.includes('google-analytics.com') || url.endsWith('app-info.json');
        if (!nonCacheableUrl) {
          return res;
        }
      }
      return fetch(request);
    }),
  );
}

/** A mock event handler type to calm tsserver checker.
 * @typedef {(ev: Event) => void} TGenericEventHandler
 */

function swInit() {
  self.addEventListener('install', /** @type {TGenericEventHandler} */ (swInstall));
  self.addEventListener('fetch', /** @type {TGenericEventHandler} */ (swFetch));
}

console.log('[serviceworker] start', changed, {
  changed,
  currentVersionStamp,
});

swInit();
