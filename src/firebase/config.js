import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbKN9k-reT5fdcG_8oqFmtoiRpqCch4Us",
  authDomain: "movie-cataloger.firebaseapp.com",
  projectId: "movie-cataloger",
  storageBucket: "movie-cataloger.firebasestorage.app",
  messagingSenderId: "769834333872",
  appId: "1:769834333872:web:dac3bceec1d2362a846d75"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
const db = getFirestore(app);

export { db };