// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged  // Import the function to monitor authentication state
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3liG-4pHYyGYuxp1Q-rb46qnjF6kMTsY",
  authDomain: "lasthope-4c848.firebaseapp.com",
  projectId: "lasthope-4c848",
  storageBucket: "lasthope-4c848.firebasestorage.app",
  messagingSenderId: "632779314493",
  appId: "1:632779314493:web:ba43e1ed1bf0e4bfbe6154",
  measurementId: "G-HKSL6HWNXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Export the necessary functions for authentication
export { 
  auth, 
  provider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
};
