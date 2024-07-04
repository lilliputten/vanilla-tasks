interface TLoadDataFileProgressParams {
  /** Percents of loaded data amount */
  progress: number | undefined;
  loaded: number;
  total: number;
  fileReader: FileReader;
}

interface TLoadDataFileOptions<T = unknown> {
  onProgress?: (params: TLoadDataFileProgressParams) => void;
  onLoaded?: (p: { data: T; fileReader: FileReader }) => void;
  onError?: (p: { error: Error; fileReader: FileReader }) => void;
  /** Async load waiting timeout (ms) */
  timeout?: number;
}
