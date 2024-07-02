type TTaskId = string;
interface TTask {
  id: TTaskId;
  name: string;
  completed?: boolean;
  created?: TTimestamp;
  updated?: TTimestamp;
}
