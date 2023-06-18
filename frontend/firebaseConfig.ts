// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTJmAelM3GfERRXDHYVVNCMGjEc-7gnLM",
  authDomain: "mediscribe-ai.firebaseapp.com",
  projectId: "mediscribe-ai",
  storageBucket: "mediscribe-ai.appspot.com",
  messagingSenderId: "109715418300",
  appId: "1:109715418300:web:8e04d2e64e1d87707174b9",
  measurementId: "G-XL53RSTV63",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const firestore = getFirestore(app)

export default app
