import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";

const firebaseApp = initializeApp({
  apiKey: process.env.VUE_APP_APIKEY,
  authDomain: "lizz-meme.firebaseapp.com",
  projectId: "lizz-meme",
  storageBucket: "lizz-meme.appspot.com",
  messagingSenderId: process.env.VUE_APP_SENDERID,
  appId: process.env.VUE_APP_APPID,
  measurementId: process.env.VUE_APP_GTAG,
});

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// auth
export const SIGNIN = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const SIGNOUT = () => signOut(auth);
export const CREATE_AUTH_STATE_LISTENER = (callback, errorHandler) => { onAuthStateChanged(auth, callback, errorHandler) }

// storage
export const UPLOAD_FILE = (filename, file) => uploadBytes(ref(storage, `images/${filename}`),file);
export const DELETE_FILE = (name) => deleteObject(ref(storage, `images/${name}`));
export const GET_IMAGE_URL = (path) => getDownloadURL(ref(storage, path));

// firestore
export const GET_COLLECTION_DOC = (root) => getDocs(collection(db, root)); 
export const CREATE_DOC = (root, docData) => addDoc(collection(db, root), docData);
export const DELETE_DOC = (root, id) => deleteDoc(doc(db, root, id));
export const CREATE_DOC_LISTENER = (root, callback, errorHandler) => { onSnapshot(collection(db, root), callback, errorHandler) }


