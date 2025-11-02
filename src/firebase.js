import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKwV9CoxAQxmZiG3-yf60qacXlYWaCjs4",
  authDomain: "co-1016.firebaseapp.com",
  projectId: "co-1016",
  storageBucket: "co-1016.firebasestorage.app",
  messagingSenderId: "501326088107",
  appId: "1:501326088107:web:9902f24a03638360e7b4ee",
  measurementId: "G-DCNM50B7BY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
