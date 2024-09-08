// firebase/auth.ts
import {
	getAuth,
	signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./clientApp";

const auth = getAuth(app);
const db = getFirestore(app);

export const signInWithEmailAndPassword = async (
	email: string,
	password: string,
	userType: "manager" | "agent"
) => {
	try {
		const userCredential = await firebaseSignInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Check user type in Firestore
		const userDoc = await getDoc(
			doc(db, userType === "manager" ? "managers" : "agents", user.uid)
		);

		if (!userDoc.exists()) {
			throw new Error("User does not exist in the database.");
		}

		return userDoc.data(); // Return user data
	} catch (error) {
		console.error("Error signing in:", error);
		throw error; // Rethrow error for handling in the component
	}
};
