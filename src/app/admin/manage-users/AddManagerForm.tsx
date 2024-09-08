// src/app/admin/manage-users/AddManagerForm.tsx
"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/clientApp";

const AddManagerForm: React.FC<{ onManagerAdded: () => void }> = ({
	onManagerAdded,
}) => {
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await addDoc(collection(db, "managers"), {
				email,
				name,
				password, // Note: Store hashed passwords, not plain text
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			setName("");
			setEmail("");
			setPassword("");
			onManagerAdded(); // Notify parent to refresh the list
			setError(""); // Clear any previous errors
		} catch (error) {
			console.error("Error adding manager:", error);
			setError("Failed to add manager. Please try again.");
		}
	};

	return (
		<div>
			<h3>Add New Manager</h3>
			<form onSubmit={handleSubmit}>
				<label>
					Name:
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</label>
				<br />
				<label>
					Email:
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>
				<br />
				<label>
					Password:
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				<br />
				<button type="submit">Add Manager</button>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default AddManagerForm;
