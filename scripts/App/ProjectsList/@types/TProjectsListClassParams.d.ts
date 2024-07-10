interface TProjectsListClassParams extends TSharedParams {
  // events: SimpleEvents;
  dataStorage: DataStorageClass;
  activeTasks: ActiveTasksClass;
}
interface TMainMenuParams extends TProjectsListClassParams {
  googleAuth: GoogleAuthClass;
}
