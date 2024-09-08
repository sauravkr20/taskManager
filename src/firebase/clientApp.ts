import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import the Firestore module

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCvcKzSfSe4pSjlCpvxVevHY-kiZxQJb3s",
	authDomain: "taskmanage-26273.firebaseapp.com",
	projectId: "taskmanage-26273",
	storageBucket: "taskmanage-26273.appspot.com",
	messagingSenderId: "112346810772",
	appId: "1:112346810772:web:493f6737eb0e1eef66a781",
	measurementId: "G-DPZDCN789W",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
