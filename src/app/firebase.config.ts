import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDd3Pa3S-X5lWavu_vdxg8RzbPkXahQaxo",
  authDomain: "gdg-be.firebaseapp.com",
  projectId: "gdg-be",
  storageBucket: "gdg-be.firebasestorage.app",
  messagingSenderId: "940845016527",
  appId: "1:940845016527:web:8f64124ec54b12e17bdeba",
  measurementId: "G-FZRMYCTVJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 