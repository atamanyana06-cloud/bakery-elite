// Імпортуємо потрібні функції з бібліотек Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Додано для роботи з профілем

const firebaseConfig = {
  apiKey: "AIzaSyCu9l-9NzV9FdxjMXPRS5--e8LWTswvo54",
  authDomain: "bakery-elite.firebaseapp.com",
  projectId: "bakery-elite",
  storageBucket: "bakery-elite.firebasestorage.app",
  messagingSenderId: "42400557850",
  appId: "1:42400557850:web:63113f9c7ba3382164daa3",
  measurementId: "G-HWWGYLMZK9"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// Створюємо посилання на базу даних Firestore та експортуємо її
export const db = getFirestore(app);

// Створюємо посилання на сервіс авторизації та експортуємо його
export const auth = getAuth(app);