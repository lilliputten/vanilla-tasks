type TProjectId = string;
interface TProject extends TListItem {
  created?: TTimestamp;
  updated?: TTimestamp;
  tasks: TTask[];
  /** Total elapsed time */
  elapsed?: number;
}
