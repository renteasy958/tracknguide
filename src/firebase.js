import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0bJgv7vNDY36P6SGDnIXttZJ1UC1rHkQ",
  authDomain: "tracksandguide.firebaseapp.com",
  projectId: "tracksandguide",
  storageBucket: "tracksandguide.firebasestorage.app",
  messagingSenderId: "202009766480",
  appId: "1:202009766480:web:c86c3327216ffd58b0bf55",
  measurementId: "G-T0DD5035VV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);
