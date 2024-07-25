/* eslint-env worker */
/// <reference path="scripts/@types/shared/serviceworker.d.ts"/>
// @ts-check
// @changed 2024.07.25, 16:55

const changed = `
@changed 2024.07.25, 16:55
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

// @ts-ignore: Wrong typings for BroadcastChannel
const swChannel = new BroadcastChannel('app');

if (swChannel) {
  // @ts-ignore: Wrong typings for BroadcastChannel
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
  // @ts-ignore: Wrong typings for BroadcastChannel
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
      // "Authorization": token,
      'Content-Type': 'application/json',
      // 'Cache-Control': 'max-age=10000',
      'Cache-Control': 'no-cache',
    }),
    // body: payload
  });
  console.log('[serviceworker:fetchAppInfo] start', {
    appInfoUrl,
    req,
    changed,
    currentVersionStamp,
    caches,
  });
  /** @type {Response} */
  let currentRes;
  fetchingAppInfoNow = Promise.all([
    // prettier-ignore
    caches.match(req),
    fetch(req, { cache: 'no-cache' }),
  ])
    .then(([cacheRes, fetchRes]) => {
      console.log('[serviceworker:fetchAppInfo] then', {
        cacheRes,
        fetchRes,
        req,
        caches,
      });
      currentRes = fetchRes;
      return Promise.all([cacheRes?.json(), fetchRes.clone().json()]);
    })
    .then(
      /** @param {TAppInfo[]} appInfos */
      (appInfos) => {
        const [cacheData, fetchData] = appInfos;
        const versionStamp = getVersionStamp(fetchData);
        const cacheStamp = getVersionStamp(cacheData);
        const hasCacheUpdated = !!cacheStamp && cacheStamp !== versionStamp;
        const isNewVersion = !!currentVersionStamp && currentVersionStamp !== versionStamp;
        const isVersionUpdated = !currentVersionStamp || currentVersionStamp !== versionStamp;
        const hasOutdated = !cacheStamp || hasCacheUpdated;
        console.log('[serviceworker:fetchAppInfo] done', {
          isNewVersion,
          isVersionUpdated,
          hasOutdated,
          versionStamp,
          currentVersionStamp,
          cacheStamp,
          cacheData,
          fetchData,
          // swCache,
          caches,
        });
        debugger;
        if (isVersionUpdated) {
          // TODO: Invalidate cache
          debugger;
          // @ts-ignore: Wrong typings for BroadcastChannel
          if (isNewVersion && swChannel) {
            swChannel.postMessage({ kind: 'versionUpdated', versionStamp });
          }
          caches.delete(staticCacheName);
          currentVersionStamp = versionStamp;
        }
        // TODO: Invalidate cache if ti's initialized and has another version stamp
        if (hasOutdated) {
          caches.open(staticCacheName).then((cache) => {
            console.log('[serviceworker:fetchAppInfo] cache', {
              cache,
              versionStamp,
            });
            debugger;
            cache.put(req, currentRes);
          });
        }
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

/* [>* @param {ActivateEvent} event <]
 * function swActivate(event) {
 *   // eslint-disable-next-line no-console
 *   console.log('[serviceworker:swActivate]', {
 *     event,
 *     changed,
 *     currentVersionStamp,
 *   });
 *   debugger;
 * }
 */

/** @param {FetchEvent} event */
function swFetch(event) {
  const { request } = event;
  const { url } = request;
  // eslint-disable-next-line no-console
  console.log('[serviceworker:swFetch]', url);
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
  // self.addEventListener('activate', [>* @type {TGenericEventHandler} <] (swActivate));
}

console.log('[serviceworker] start', changed, {
  changed,
  currentVersionStamp,
});

swInit();
