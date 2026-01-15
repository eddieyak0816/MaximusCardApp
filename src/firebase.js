import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpFBIn2axCGBO24TbCxx1Ia25usaSACQg",
  authDomain: "maximus-collectibles.firebaseapp.com",
  projectId: "maximus-collectibles",
  storageBucket: "maximus-collectibles.firebasestorage.app",
  messagingSenderId: "257082978862",
  appId: "1:257082978862:web:3d944be4d44b3c1852e5bf"
};

// Initialize Firebase (Done only once)
const app = initializeApp(firebaseConfig);

// Export the database tools
export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously so the client can read/write when rules require auth
signInAnonymously(auth).catch(e => console.error('Anon sign-in failed:', e));