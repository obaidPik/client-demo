// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWyJSGxusErUmzE_2wK4xyLMUSU3cuCb0",
  authDomain: "temporal-customer-service.firebaseapp.com",
  projectId: "temporal-customer-service",
  storageBucket: "temporal-customer-service.appspot.com",
  messagingSenderId: "939361297737",
  appId: "1:939361297737:web:10308df616de59fc732698",
  measurementId: "G-WJ7TTNVX3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;