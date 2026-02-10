// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa5ksRKKZYVM2_ac_ljXlzHxN0z2lyVms",
  authDomain: "busguiderapp-2ed8d.firebaseapp.com",
  projectId: "busguiderapp-2ed8d",
  storageBucket: "busguiderapp-2ed8d.appspot.com", // small fix: remove extra ".app"
  messagingSenderId: "397060238358",
  appId: "1:397060238358:web:b363c81f88518cffaf1937",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and export it
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export default app;