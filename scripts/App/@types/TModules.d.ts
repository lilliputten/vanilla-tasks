interface TModules {
  dataStorage: import('../DataStorage/DataStorageClass.js').DataStorageClass;
  firebase: import('../Firebase/FirebaseClass.js').FirebaseClass;
  activeTasks: import('../ActiveTasks/ActiveTasksClass.js').ActiveTasksClass;
  mainMenu: import('../MainMenu/MainMenuClass.js').MainMenuClass;
  googleAuth: import('../GoogleAuth/GoogleAuthClass.js').GoogleAuthClass;
}
