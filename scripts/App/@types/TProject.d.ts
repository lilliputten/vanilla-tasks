type TProjectId = string;
interface TProject extends TListItem {
  created?: TTimestamp;
  updated?: TTimestamp;
  tasks: TTask[];
}
