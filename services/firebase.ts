
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  updateDoc,
  deleteDoc,
  limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Note: In a production app, these would be in environment variables.
// Since I'm creating a standalone demo, I'm providing the structure.
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey-Replace-With-Actual",
  authDomain: "my-kitchen-demo.firebaseapp.com",
  projectId: "my-kitchen-demo",
  storageBucket: "my-kitchen-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

export { 
  collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, where, updateDoc, deleteDoc, limit 
};
