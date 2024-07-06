type TTaskId = string;
type TTaskStatus = 'pending' | 'active' | 'completed';
interface TTask extends TListItem {
  // completed?: boolean; // NOTE: Old version, before 0.0.9
  /** Current task status */
  status?: TTaskStatus;
  /** Milliseconds of the measured task execution time */
  elapsed?: number;
  /** Last measured timestamp */
  measured?: TTimestamp;
  created?: TTimestamp;
  updated?: TTimestamp;
}
