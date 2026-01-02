import { db } from './config'; // Твій колишній firebase.js, перейменований на config.js
import { collection, getDocs } from 'firebase/firestore';

// Функція для отримання всіх товарів (використовуй її в Catalog.jsx)
export const getProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};