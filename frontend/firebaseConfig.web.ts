import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";
import { firebaseAppOptions } from "./firebaseConfig.shared";

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseAppOptions);
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
  (app as { __auth?: Auth }).__auth = auth;
} else {
  app = getApp();
  auth =
    (app as { __auth?: Auth }).__auth ||
    initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
}

export { auth };
export default app;
