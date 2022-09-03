// Import the functions you need from the SDKs you need
// import firebase from './firebase';
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL5oQ-HfVf_xybE0VDWDGMCqhZzN0J4BQ",
  authDomain: "ubigesture.firebaseapp.com",
  projectId: "ubigesture",
  storageBucket: "ubigesture.appspot.com",
  messagingSenderId: "530047324449",
  appId: "1:530047324449:web:e88c47175633d3920c6e60",
  measurementId: "G-2EWNKH04ZV"
};

const firebaseConfig_test = {
  apiKey: "AIzaSyA8ghxpaFmkciIaDaj-b8yOauWoyrutYaY",
  authDomain: "ubigesture-test.firebaseapp.com",
  projectId: "ubigesture-test",
  storageBucket: "ubigesture-test.appspot.com",
  messagingSenderId: "216316793909",
  appId: "1:216316793909:web:184867f9c904d730bacd7c",
  measurementId: "G-DY6MXLBJGD"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig); // leave this line uncommented for *actual annotation*
const app = initializeApp(firebaseConfig_test); // leave this line uncommented for *testing*
const analytics = getAnalytics(app);
const storage = getStorage(app);
export {firebase, storage};