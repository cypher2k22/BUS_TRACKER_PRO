import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa5ksRKKZYVM2_ac_ljXlzHxN0z2lyVms",
  authDomain: "busguiderapp-2ed8d.firebaseapp.com",
  projectId: "busguiderapp-2ed8d",
  storageBucket: "busguiderapp-2ed8d.appspot.com",
  messagingSenderId: "397060238358",
  appId: "1:397060238358:web:b363c81f88518cffaf1937",
  databaseURL: "https://busguiderapp-2ed8d-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  (app as any).__auth = auth; // Fast Refresh protection
} else {
  app = getApp();
  auth = (app as any).__auth || initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export default app;
