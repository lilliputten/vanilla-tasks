interface TCoreParams extends TSharedParams {
  appEvents: SimpleEvents;
  modules: TModules;
}
interface TAppParams extends TCoreParams {
  appEvents: SimpleEvents;
  dataStorage: DataStorageClass;
  activeTasks: ActiveTasksClass;
}
interface TMainMenuParams extends TAppParams {
  googleAuth: GoogleAuthClass;
}
interface TFirebaseParams extends TAppParams {
  googleAuth: GoogleAuthClass;
}
