// @ts-check

// import { commonNotify } from '../../common/CommonNotify.js';
// import * as AppHelpers from '../AppHelpers.js';

// @ts-ignore: TODO: To use correct typings
// eslint-disable-next-line import/no-unresolved
import * as firebaseApp from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';

// @ts-ignore: TODO: To use correct typings
// eslint-disable-next-line import/no-unresolved
import * as firebaseAnalytics from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js';

// @ts-ignore: TODO: To use correct typings
// eslint-disable-next-line import/no-unresolved
import * as firebaseStore from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-lite.js';

const {
  // prettier-ignore
  initializeApp,
} = /** @type {import('firebase/app')} */ (firebaseApp);

// const FirebaseStore = [>* @type {import('firebase/firestore')} <] (firebaseStore);
const {
  // prettier-ignore
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  // updateDoc,
  doc,
  // QuerySnapshot,
} = /** @type {import('firebase/firestore')} */ (firebaseStore);

const {
  // prettier-ignore
  getAnalytics,
} = /** @type {import('firebase/analytics')} */ (firebaseAnalytics);

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBqboA2DsYCJJrjFYlKjdJXwQMd3vWavko',
  // authDomain: 'vanilla-tasks.lilliputten.com',
  authDomain: 'vanilla-tasks.firebaseapp.com',
  projectId: 'vanilla-tasks',
  storageBucket: 'vanilla-tasks.appspot.com',
  messagingSenderId: '620506919435',
  appId: '1:620506919435:web:8999b04eb3f77d12c9cd0e',
  measurementId: 'G-NQHTMVJ1VJ',
};

export class FirebaseClass {
  /** @type {TFirebaseParams['dataStorage']} */
  dataStorage;

  /** @type {TFirebaseParams['googleAuth']} */
  googleAuth;

  /** @type {TCoreParams['appEvents']} */
  events;

  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {import('firebase/app').FirebaseApp} */
  app;

  /** @type {import('firebase/analytics').Analytics} */
  analytics;

  /** @type {import('firebase/firestore').Firestore} */
  db;

  /** @type {import('firebase/firestore').CollectionReference<TUserData, TUserData>} */
  userDataColRef;

  /** @constructor
   * @param {TFirebaseParams} params
   */
  constructor(params) {
    // const { callbacks } = this;

    const {
      modules,
      appEvents,
      dataStorage,
      // googleAuth,
    } = params;

    this.events = appEvents;

    modules.firebase = this;

    this.dataStorage = dataStorage;
    // this.googleAuth = googleAuth;

    // Init handler callbacks...
    // callbacks.onFirebaseToggle = this.onFirebaseToggle.bind(this);

    this.initFirebase();

    // Tests...
    // this.getAllUsersData();
    // this.getUserData('qunWzSKvKLwfxhnvkTH9');
    this.hasUserData('test3');
    // this.saveUserData('test2', { test: 'test2' });
  }

  initFirebase() {
    // Initialize Firebase
    const app = this.getApp();
    this.analytics = getAnalytics(app);
  }

  getApp() {
    if (!this.app) {
      this.app = initializeApp(firebaseConfig);
    }
    return this.app;
  }

  getDb() {
    if (!this.db) {
      const app = this.getApp();
      // @see https://firebase.google.com/docs/web/setup#access-firebase
      /** @type {import('firebase/firestore').Firestore} */
      const db = getFirestore(app);
      this.db = db;
    }
    return this.db;
  }

  getUserDataCollection() {
    if (!this.userDataColRef) {
      const db = this.getDb();
      /** @type {import('firebase/firestore').CollectionReference<TUserData, TUserData>} */
      this.userDataColRef = collection(db, 'userData');
    }
    return this.userDataColRef;
  }

  /** Update or create new data record
   * @param {TUserDataKey} key
   * @return {Promise<boolean | void>}
   */
  saveUserData(key, userData) {
    const colRef = this.getUserDataCollection();
    const docRef = doc(colRef, key);
    // TODO: To check if record exists with `hasUserData` and then update with `updateDoc` or create new with `setDoc`?
    console.log('[FirebaseClass:saveUserData]', {
      key,
      userData,
      docRef,
      colRef,
    });
    return setDoc(docRef, userData)
      .then(() => {
        console.log('[FirebaseClass:saveUserData:setDoc] success', {
          key,
          userData,
          docRef,
          colRef,
        });
        return true;
      })
      .catch(
        /** @param {Error} error */
        (error) => {
          // eslint-disable-next-line no-console
          console.error('[FirebaseClass:saveUserData:setDoc]', error);
          debugger; // eslint-disable-line no-debugger
        },
      );
  }

  /** Check if data record exists
   * @param {TUserDataKey} key
   * @return {Promise<boolean | void>}
   */
  hasUserData(key) {
    const colRef = this.getUserDataCollection();
    const docRef = doc(colRef, key);
    return getDoc(docRef)
      .then((docSnap) => {
        return docSnap.exists();
      })
      .catch(
        /** @param {Error} error */
        (error) => {
          // eslint-disable-next-line no-console
          console.error('[FirebaseClass:hasUserData:getDoc]', error);
          debugger; // eslint-disable-line no-debugger
        },
      );
  }

  /** Get data record
   * @param {TUserDataKey} key
   * @return {Promise<TUserData | void>}
   */
  getUserData(key) {
    const colRef = this.getUserDataCollection();
    const docRef = doc(colRef, key);
    console.log('[FirebaseClass:getUserData]', {
      docRef,
      colRef,
    });
    return getDoc(docRef)
      .then((docSnap) => {
        if (!docSnap.exists()) {
          return undefined;
        }
        const data = docSnap.data();
        console.log('[FirebaseClass:getUserData:getDoc]', {
          data,
          docSnap,
          docRef,
          colRef,
        });
        debugger;
        return data;
      })
      .catch(
        /** @param {Error} error */
        (error) => {
          // eslint-disable-next-line no-console
          console.error('[FirebaseClass:getUserData:getDoc]', error);
          debugger; // eslint-disable-line no-debugger
        },
      );
  }

  /*
   * @return {Promise<TUserData[] | void>}
   */
  getAllUsersData() {
    const colRef = this.getUserDataCollection();
    console.log('[FirebaseClass:getAllUsersData]', {
      colRef,
    });
    return getDocs(colRef)
      .then(
        /** @param {import('firebase/firestore').QuerySnapshot<TUserData, TUserData>} qSnap */
        (qSnap) => {
          /** @type {import('firebase/firestore').QueryDocumentSnapshot<TUserData, TUserData>[]} */
          const docs = qSnap.docs;
          console.log('[FirebaseClass:getAllUsersData:getDocs]', {
            docs,
          });
          return docs.map((docSnap) => {
            const data = docSnap.data();
            console.log('[FirebaseClass:getAllUsersData:getDocs] item', {
              data,
              docSnap,
              docs,
              colRef,
            });
            return data;
          });
        },
      )
      .catch(
        /** @param {Error} error */
        (error) => {
          // eslint-disable-next-line no-console
          console.error('[FirebaseClass:getAllUsersData:getDocs]', error);
          debugger; // eslint-disable-line no-debugger
        },
      );
  }

  // Actions...
}
