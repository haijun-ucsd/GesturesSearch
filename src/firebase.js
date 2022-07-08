// Import the functions you need from the SDKs you need
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);