/** Data keys = user email */
type TUserDataKey = string;

interface TUserData {
  test?: string; // DEBUG
  email: TUserDataKey;
  version: string;
  updated: TTimestamp;
  projects: TProject[];
  currentProjectId?: TProjectId;
}
