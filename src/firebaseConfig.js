//
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Import Realtime Database
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

const firebaseConfig = {
  apiKey: 'AIzaSyCkzLCQeumFcc8LioAsFNqHltgDQSFcgHg',

  authDomain: 'pink-mahi-282c2.firebaseapp.com',

  databaseURL: 'https://pink-mahi-282c2-default-rtdb.firebaseio.com',

  projectId: 'pink-mahi-282c2',

  storageBucket: 'pink-mahi-282c2.appspot.com',

  messagingSenderId: '830518421135',

  appId: '1:830518421135:web:4c5c57116241e117d472fa',

  measurementId: 'G-NGWKPLVV75',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const rtdb = getDatabase(app); // Initialize Realtime Database
export const firestore = getFirestore(app); // Initialize Firestore
export const auth = getAuth(app); // Export the auth service
