import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Import Realtime Database
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

// Firebase configuration
//const firebaseConfig = {
//apiKey: 'AIzaSyDobV7xUQ6JemlZUKQcdtLWfFGOzUMUn2w',
// authDomain: 'esp32sensordata-c601b.firebaseapp.com',
//  databaseURL: 'https://esp32sensordata-c601b-default-rtdb.firebaseio.com',
// projectId: 'esp32sensordata-c601b',
// storageBucket: 'esp32sensordata-c601b.appspot.com',
// messagingSenderId: '413357863110',
// appId: '1:413357863110:web:9f117b6fce74247bac67c7',
//};

const firebaseConfig = {
  apiKey: 'AIzaSyCkzLCQeumFcc8LioAsFNqHltgDQSFcgHg',

  authDomain: 'pink-mahi-282c2.firebaseapp.com',

  databaseURL: 'https://pink-mahi-282c2-default-rtdb.firebaseio.com',

  projectId: 'pink-mahi-282c2',

  storageBucket: 'pink-mahi-282c2.appspot.com',

  messagingSenderId: '830518421135',

  appId: '1:830518421135:web:9fc560f712514a27d472fa',

  measurementId: 'G-9DTDJLCGLL',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const rtdb = getDatabase(app); // Initialize Realtime Database
export const firestore = getFirestore(app); // Initialize Firestore
export const auth = getAuth(app); // Export the auth service
