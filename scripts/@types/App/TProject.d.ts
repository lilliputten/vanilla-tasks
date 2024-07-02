type TProjectId = string;
interface TProject {
  id: TProjectId;
  name: string;
  created?: TTimestamp;
  updated?: TTimestamp;
  tasks: TTask[];
}
