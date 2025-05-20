// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebase from 'firebase/compat/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBoBtK77VWCQxsscAdjIvGsaPgiNXjgqFI",
  authDomain: "website-builder-45fca.firebaseapp.com",
  projectId: "website-builder-45fca",
  storageBucket: "website-builder-45fca.firebasestorage.app",
  messagingSenderId: "43778708268",
  appId: "1:43778708268:web:ddf28e30eee65364251289",
  measurementId: "G-H25Y0X3F47"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export {storage, firebase}
