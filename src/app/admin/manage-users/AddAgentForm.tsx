// src/app/admin/manage-users/AddAgentForm.tsx
"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/clientApp";

const AddAgentForm: React.FC<{
	onAgentAdded: () => void;
}> = ({ onAgentAdded }) => {
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [managerEmail, setManagerEmail] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await addDoc(collection(db, "agents"), {
				email,
				name,
				managerEmail,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
			setName("");
			setEmail("");
			onAgentAdded(); // Notify parent to refresh the list
			setError(""); // Clear any previous errors
		} catch (error) {
			console.error("Error adding agent:", error);
			setError("Failed to add agent. Please try again.");
		}
	};

	return (
		<div>
			<h3>Add New Agent</h3>
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
					Manager Email:
					<input
						type="managerEmail"
						value={managerEmail}
						onChange={(e) => setManagerEmail(e.target.value)}
						required
					/>
				</label>
				<br />
				<button type="submit">Add Agent</button>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default AddAgentForm;
