export class AppEventsClass {
  /** @type {TCoreParams['events']} */
  events;

  /** @type {TCoreParams['modules']} */
  modules;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  settingData = false;

  /** @constructor
   * @param {TCoreParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { modules, events } = params;

    this.events = events;
    this.modules = modules;

    events.add('AppInited', this.onAppInited.bind(this));
    events.add('userSignedIn', this.onUserSignedIn.bind(this));
    events.add('userSignedOut', this.onUserSignedOut.bind(this));
    events.add('updatedStorageProjects', this.onUpdatedStorageProjects.bind(this));
  }

  /** @param {TCoreParams} coreParams */
  onAppInited(coreParams) {
    const { modules } = coreParams;
    const { events } = this;
    // DEBUG
    console.log('[AppEventsClass:onAppInited]', {
      modules,
      events,
    });
  }

  // Event handlers...

  /** @param {TUserInfo} data */
  onUserSignedIn(userData) {
    const { modules } = this;
    const { dataStorage, googleAuth, firebase } = modules;
    const { email } = userData;
    console.log('[AppEventsClass:onUserSignedIn] start', {
      email,
      userData,
      dataStorage,
      googleAuth,
      firebase,
    });
    firebase.loadUserData(email).then((data) => {
      console.log('[AppEventsClass:onUserSignedIn] loadUserData', {
        email,
        data,
      });
      if (data) {
        const { projects, version, updated } = data;
        console.log('[AppEventsClass:onUserSignedIn] loadUserData has data', {
          email,
          data,
          version,
          updated,
        });
        // TODO: Check local and remote data, offer to merge or override (keep remote or local)?
        this.settingData = true;
        dataStorage.setNewProjects(projects);
        // TODO: Check if active tasks updated?
        this.settingData = false;
      }
    });
  }

  /** @param {TUserInfo} data */
  onUserSignedOut(data) {
    const { modules } = this;
    const { dataStorage, googleAuth, firebase } = modules;
    console.log('[AppEventsClass:onUserSignedOut]', {
      data,
      dataStorage,
      googleAuth,
      firebase,
    });
    debugger;
    // TODO: Clear data? Ask user to clear or keep the current data
  }

  /** @param {TProject[]} projects */
  onUpdatedStorageProjects(projects) {
    const { modules } = this;
    if (this.settingData) {
      // Ignore update data evenets while updatting data...
      return;
    }
    const { dataStorage, googleAuth, firebase } = modules;
    const isSignedIn = googleAuth.isSignedIn();
    console.log('[AppEventsClass:onUpdatedStorageProjects]', {
      isSignedIn,
      projects,
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
      };
      console.log('[AppEventsClass:onUpdatedStorageProjects] signed', {
        updated,
        version,
      });
      debugger;
      firebase.saveUserData(email, userData);
    }
  }
}
