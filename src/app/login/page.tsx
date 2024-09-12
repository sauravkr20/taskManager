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
			console.log("userSnapshot", userSnapshot);

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
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
				<h1 className="text-2xl font-bold mb-4">Login</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block font-medium mb-1">Email:</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="border border-gray-300 rounded-md px-4 py-2 w-full"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">Password:</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="border border-gray-300 rounded-md px-4 py-2 w-full"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">Role:</label>
						<select
							value={role}
							onChange={(e) => setRole(e.target.value as "manager" | "agent")}
							className="border border-gray-300 rounded-md px-4 py-2 w-full"
						>
							<option value="manager">Manager</option>
							<option value="agent">Agent</option>
						</select>
					</div>
					<button
						type="submit"
						className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md w-full"
					>
						Login
					</button>
				</form>
				{error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
			</div>
		</div>
	);
};

export default LoginPage;
