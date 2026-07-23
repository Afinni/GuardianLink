import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCPTwy39TJsCGmyyLIA1IF0Cj065jxUk78",
  authDomain: "blindstick-82f03.firebaseapp.com",
  projectId: "blindstick-82f03",
  storageBucket: "blindstick-82f03.firebasestorage.app",
  messagingSenderId: "808803570882",
  appId: "1:808803570882:web:ce55595de3e7fdbf09175b",
  measurementId: "G-YXCHDM0P0J",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
