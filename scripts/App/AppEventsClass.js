// @ts-check

export class AppEventsClass {
  /** @type {TCoreParams['events']} */
  events;

  /** @type {TCoreParams['modules']} */
  modules;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  allInited = false;

  // settingData = false;

  /** @constructor
   * @param {TCoreParams} params
   */
  constructor(params) {
    // const { callbacks } = this;

    const { modules, events } = params;

    this.events = events;
    this.modules = modules;

    events.add('AppInited', this.onAppInited.bind(this));
    // events.add('userSignedIn', this.onUserSignedIn.bind(this));
    // events.add('userSignedOut', this.onUserSignedOut.bind(this));
    events.add('updatedProjectsData', this.onUpdatedProjects.bind(this));
    events.add('updatedCurrentProjectId', this.onUpdatedProjects.bind(this));

    events.add('AuthInited', this.onAuthInited.bind(this));
    events.add('newProjects', this.onSetNewData.bind(this));
  }

  /** @param {TCoreParams} _coreParams */
  onAppInited(_coreParams) {
    /* // DEBUG
     * const { modules } = coreParams;
     * const { events } = this;
     * console.log('[AppEventsClass:onAppInited]', {
     *   modules,
     *   events,
     * });
     */
  }

  onSetNewData() {
    if (this.allInited) {
      this.initActiveTasks();
    }
  }

  onAuthInited() {
    this.allInited = true;
    this.initActiveTasks();
  }

  initActiveTasks() {
    console.log('[AppEventsClass:initActiveTasks]');
    const { dataStorage, activeTasks } = this.modules;
    const projects = dataStorage.projects;
    /** @type {TActiveTask[]} */
    const activeTasksList = [];
    // Try to find all the active tasks...
    projects.forEach(({ id: projectId, tasks }) => {
      tasks.forEach((task) => {
        const { id: taskId, status } = task;
        if (status === 'active') {
          /** @type {TActiveTask} */
          const activeTask = {
            projectId,
            taskId,
            task,
          };
          activeTasksList.push(activeTask);
        }
      });
    });
    return activeTasks.initTasks(activeTasksList);
  }

  // Event handlers...

  /* @param {TProject[]} projects */
  onUpdatedProjects() {
    const { modules } = this;
    const { dataStorage, googleAuth, firebase } = modules;
    const { projects, currentProjectId } = dataStorage;
    if (googleAuth.settingData) {
      // Ignore update data events while updatting data...
      return;
    }
    const isSignedIn = googleAuth.isSignedIn();
    console.log('[AppEventsClass:onUpdatedProjects]', {
      isSignedIn,
      projects,
      currentProjectId,
      dataStorage,
      googleAuth,
      firebase,
    });
    if (isSignedIn) {
      const { version } = dataStorage;
      const { userEmail: email } = googleAuth;
      const updated = Date.now();
      /** @type {TUserData} */
      const userData = {
        email,
        version,
        updated,
        projects,
        currentProjectId,
      };
      console.log('[AppEventsClass:onUpdatedProjects] signed', {
        updated,
        version,
      });
      firebase.saveUserData(email, userData);
    }
  }
}
