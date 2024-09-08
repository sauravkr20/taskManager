// firebase/managers.ts
import { db } from "./clientApp";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addManager = async (
	email: string,
	password: string,
	name: string
) => {
	try {
		const docRef = await addDoc(collection(db, "managers"), {
			email,
			password, // Note: Store hashed passwords, not plain text
			name,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		console.log("Manager added with ID:", docRef.id);
	} catch (error) {
		console.error("Error adding manager:", error);
	}
};
