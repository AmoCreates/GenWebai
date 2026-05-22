// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-website-builder-4210d.firebaseapp.com",
  projectId: "ai-website-builder-4210d",
  storageBucket: "ai-website-builder-4210d.firebasestorage.app",
  messagingSenderId: "520403108321",
  appId: "1:520403108321:web:4f85f2fb836e14bd6b12a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {auth, provider};