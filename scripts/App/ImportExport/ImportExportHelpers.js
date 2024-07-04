// import { getErrorText } from 'src/helpers';

import * as CommonHelpers from '../../common/CommonHelpers.js';

// TODO: Add possibility to cancel the loading for user?
/**
 * @param {File} file
 * @param {TLoadDataFileOptions} [opts={}]
 * @returns {Promise}
 */
export function loadDataFile(file, opts = {}) {
  const {
    name: fileName,
    // type: fileType,
    // size: fileSize,
  } = file;
  const { onProgress, onLoaded, onError, timeout } = opts;
  return new Promise(function loadDataFile_promise(resolve, reject) {
    const fileReader = new FileReader();
    /* console.log('[ImportExportHelpers:loadDataFile:onloadend] start', {
     *   fileReader,
     *   // file,
     *   fileName,
     *   // fileType,
     *   // fileSize,
     * });
     */
    // Set load timeout (if specified)...
    let timeoutHandler = timeout
      ? setTimeout(function loadDataFile_timeout() {
          // TODO: Ensure that abort processing correct in all the standard handlers below?
          fileReader.abort();
          const errMsg =
            'Timeout of ' + timeout + 'ms exceeded during upload of file "' + fileName + '"';
          const timeoutError = new Error(errMsg);
          // eslint-disable-next-line no-console
          console.error('[ImportExportHelpers:loadDataFile] timeout error', {
            timeoutError,
            timeout,
            fileName,
            fileReader,
          });
          debugger; // eslint-disable-line no-debugger
          if (onError) {
            onError({ error: timeoutError, fileReader });
          }
          return reject(timeoutError);
        }, timeout)
      : undefined;
    function finishLoading() {
      if (timeoutHandler) {
        clearTimeout(timeoutHandler);
        timeoutHandler = undefined;
      }
    }
    /* // TODO: Other events? @see: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
     * - abort
     * - error
     * - load
     * - loadend
     * - loadstart
     * - progress
     */
    if (onProgress) {
      // Optional progress handler...
      fileReader.onprogress = function loadDataFile_onProgress(ev) {
        const {
          // isTrusted, // true
          // bubbles, // false
          // cancelBubble, // false
          // cancelable, // false
          // composed, // false
          // currentTarget, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
          // defaultPrevented, // false
          // eventPhase, // 2
          lengthComputable, // true
          loaded, // 5878
          // returnValue, // true
          // srcElement, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
          // target, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
          // timeStamp, // 25930.29999998212
          total, // 5878
        } = ev;
        const progress = lengthComputable && total ? Math.round((loaded * 100) / total) : undefined;
        /* console.log('[ImportExportHelpers:loadDataFile] progress', {
         *   progress,
         *   fileName,
         *   lengthComputable, // true
         *   loaded, // 5878
         *   // target, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
         *   total, // 5878
         *   ev,
         *   fileReader,
         * });
         */
        onProgress({ progress, loaded, total, fileReader });
      };
    }
    // Successfully data loaded handler...
    fileReader.onloadend = function loadDataFile_onLoaded(ev) {
      const {
        // isTrusted, // true
        // bubbles, // false
        // cancelBubble, // false
        // cancelable, // false
        // composed, // false
        // currentTarget, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
        // defaultPrevented, // false
        // eventPhase, // 2
        // lengthComputable, // true
        // loaded, // 5878
        // returnValue, // true
        // srcElement, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
        target, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
        // timeStamp, // 25930.29999998212
        // total, // 5878
      } = ev;
      try {
        const rawResult = target?.result;
        // TODO: Catch parse errors...
        const data = rawResult && JSON.parse(rawResult);
        /* console.log('[ImportExportHelpers:loadDataFile] onloadend', {
         *   data,
         *   rawResult,
         *   // loaded, // 5878
         *   target, // FileReader {readyState: 2, result: '[\n  {\n    "producer_graph_id": 0,\n    "consumer_gr…_id": 53,\n    "amount": 0.07788214412864229\n  }\n]', error: null, onloadstart: null, onprogress: null, …}
         *   // total, // 5878
         *   ev,
         *   fileReader,
         *   fileName,
         * });
         */
        // TODO: Get and return file info also?
        if (onLoaded) {
          onLoaded({ data, fileReader });
        }
        return resolve(data);
      } catch (error) {
        const errMsg = [
          'Data processing error for file "' + fileName + '"',
          CommonHelpers.getErrorText(error),
        ]
          .filter(Boolean)
          .join(': ');
        const dataError = new Error(errMsg);
        // eslint-disable-next-line no-console
        console.error('[ImportExportHelpers:loadDataFile] onloadend: get data error', {
          dataError,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        if (onError) {
          onError({ error: dataError, fileReader });
        }
        return reject(dataError);
      } finally {
        finishLoading();
      }
    };
    // Error handler...
    fileReader.onerror = function loadDataFile_onError(ev) {
      const {
        // isTrusted, // true
        // bubbles, // false
        // cancelBubble, // false
        // cancelable, // false
        // composed, // false
        // currentTarget, // FileReader {readyState: 2, result: null, error: DOMException: A requested file or directory could not be found at the time an operation was process…, onloadstart: null, onprogress: null, …}
        // defaultPrevented, // false
        // eventPhase, // 2
        // lengthComputable, // false
        loaded, // 0
        // returnValue, // true
        // srcElement, // FileReader {readyState: 2, result: null, error: DOMException: A requested file or directory could not be found at the time an operation was process…, onloadstart: null, onprogress: null, …}
        target, // FileReader {readyState: 2, result: null, error: DOMException: A requested file or directory could not be found at the time an operation was process…, onloadstart: null, onprogress: null, …}
        // timeStamp, // 17715.90000000596
        // total, // 0
        type: errorType, // "error"
      } = ev;
      // eslint-disable-next-line no-console
      console.error('[ImportExportHelpers:loadDataFile] onerror', {
        fileName,
        loaded, // 0
        target, // FileReader {readyState: 2, result: null, error: DOMException: A requested file or directory could not be found at the time an operation was process…, onloadstart: null, onprogress: null, …}
        errorType, // "error"
        ev,
      });
      let resultError;
      if (!target) {
        // Unknown (empty?) error
        const errMsg = 'Unknown data loading error for file "' + fileName + '"';
        resultError = new Error(errMsg);
      } else {
        // Error from event...
        const error = target.error;
        const errMsg = [
          'Data loading error for file "' + fileName + '"',
          CommonHelpers.getErrorText(error),
        ]
          .filter(Boolean)
          .join(': ');
        resultError = new Error(errMsg);
      }
      // eslint-disable-next-line no-console
      console.error('[ImportExportHelpers:loadDataFile] onerror: event error', {
        // error,
        resultError,
      });
      debugger; // eslint-disable-line no-debugger
      if (onError) {
        onError({ error: resultError, fileReader });
      }
      finishLoading();
      return reject(resultError);
    };
    // Start loading...
    fileReader.readAsText(file);
  });
}
