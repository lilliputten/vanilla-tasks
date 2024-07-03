type TTaskId = string;
interface TTask extends TListItem {
  completed?: boolean;
  created?: TTimestamp;
  updated?: TTimestamp;
}
