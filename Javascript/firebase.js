// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc,query, where } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable,deleteObject  } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2gO-kO28UExvhn8SZDLxoEENKlXUY3nI",
  authDomain: "new-app-011.firebaseapp.com",
  projectId: "new-app-011",
  storageBucket: "new-app-011.appspot.com",
  messagingSenderId: "667434774644",
  appId: "1:667434774644:web:4fa02bb9c71fa2806ce121"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth();

// Initialize Firebase Storage
const storage = getStorage(app);



export {
  app,
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  getDoc,
  getStorage,
   ref, 
   uploadBytes,
    getDownloadURL ,
    storage,
    query, where,
    uploadBytesResumable,
    deleteObject
}