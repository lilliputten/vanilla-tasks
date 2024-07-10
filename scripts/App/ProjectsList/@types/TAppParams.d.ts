interface TAppParams extends TSharedParams {
  // events: SimpleEvents;
  dataStorage: DataStorageClass;
  activeTasks: ActiveTasksClass;
}
interface TMainMenuParams extends TAppParams {
  googleAuth: GoogleAuthClass;
}
