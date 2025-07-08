// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnfRjAbS5eH-16fe_5zvAONHWPGOmJsEg",
  authDomain: "echo-ai-53d8b.firebaseapp.com",
  projectId: "echo-ai-53d8b",
  storageBucket: "echo-ai-53d8b.firebasestorage.app",
  messagingSenderId: "494788972616",
  appId: "1:494788972616:web:e28fab500417f30299887d",
  measurementId: "G-5D739251QE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };