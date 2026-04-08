// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// User provided configuration
const firebaseConfig = {
    apiKey: "AIzaSyA35uv9JUC64iDQSiszn8oyH7eySxbfsWk",
    authDomain: "tinnitusoff-e61c4.firebaseapp.com",
    projectId: "tinnitusoff-e61c4",
    storageBucket: "tinnitusoff-e61c4.firebasestorage.app",
    messagingSenderId: "1076993132357",
    appId: "1:1076993132357:web:6a439600cf61fbb617202c",
    measurementId: "G-HBW07KGSN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
