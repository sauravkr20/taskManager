// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice"; // Adjust the import path as necessary
import { useRouter } from "next/navigation";
import { db } from "../../firebase/clientApp"; // Adjust the import path as necessary
import { collection, getDocs, query, where } from "firebase/firestore";

const LoginPage = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [role, setRole] = useState<"manager" | "agent">("manager"); // Default to manager
	const [error, setError] = useState<string>("");
	const dispatch = useDispatch();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const q = query(
				collection(db, role === "manager" ? "managers" : "agents"),
				where("email", "==", email),
				where("password", "==", password)
			);
			const userSnapshot = await getDocs(q);

			if (userSnapshot.empty) {
				setError("Invalid email or password");
				return;
			}

			const user = userSnapshot.docs[0].data();
			// Dispatch user details to the Redux store
			dispatch(
				setUser({
					name: user.name,
					email: user.email,
					role, // Use the selected role
				})
			);

			// Redirect to the tasks page
			router.push("/tasks");
		} catch (error) {
			console.error("Error logging in:", error);
			setError("An error occurred. Please try again later.");
		}
	};

	return (
		<div>
			<h1>Login</h1>
			<form onSubmit={handleSubmit}>
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
				<label>
					Role:
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as "manager" | "agent")}
					>
						<option value="manager">Manager</option>
						<option value="agent">Agent</option>
					</select>
				</label>
				<br />
				<button type="submit">Login</button>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default LoginPage;
