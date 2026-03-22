import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9UZAzjg2Qq7u63ita_kx7aDXgR8PZfvg",
  authDomain: "union-gestion.firebaseapp.com",
  projectId: "union-gestion",
  storageBucket: "union-gestion.firebasestorage.app",
  messagingSenderId: "803900731923",
  appId: "1:803900741923:web:82d4ccebd0e5c24c8185e6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);