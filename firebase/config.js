import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD-wQmIreMXVoDp3wl4OFdIz7PVlaF65NQ",
    authDomain: "alyfe-27bba.firebaseapp.com",
    projectId: "alyfe-27bba",
    storageBucket: "alyfe-27bba.firebasestorage.app",
    messagingSenderId: "409170847061",
    appId: "1:409170847061:web:b26534c3ea5be165143bdc"
};

// Initialise Firebase using ALYFE's project configuration
const app = initializeApp(firebaseConfig);

//Export the Firebase services used by the application
export const auth = getAuth(app);
export const db = getFirestore(app);