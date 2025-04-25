import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAzHKTlmVLHDtJAw76PfDoyqEwEFfneXpA",
  authDomain: "tisd-ab6c5.firebaseapp.com",
  databaseURL: "https://tisd-ab6c5-default-rtdb.firebaseio.com",
  projectId: "tisd-ab6c5",
  storageBucket: "tisd-ab6c5.firebasestorage.app",
  messagingSenderId: "1029213958787",
  appId: "1:1029213958787:web:73086c75f6a7f396d7a1b6",
  measurementId: "G-1SF80T9NFV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;