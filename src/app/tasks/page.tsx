// src/app/tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { db } from "../../firebase/clientApp";
import {
	collection,
	getDocs,
	query,
	where,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Adjust the import path as necessary
import { Task } from "@/types/users";

const TasksPage = () => {
	const user = useSelector((state: RootState) => state.user.user); // Access user from Redux store
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTask, setNewTask] = useState<{
		name: string;
		description: string;
		agentEmail: string;
	}>({
		name: "",
		description: "",
		agentEmail: "",
	});
	const [error, setError] = useState<string>("");
	const router = useRouter(); // Initialize the router

	useEffect(() => {
		// Check if user is null and redirect to login
		if (!user) {
			router.push("/login"); // Redirect to login page if user is not authenticated
		} else {
			fetchTasks(); // Fetch tasks if user is authenticated
		}
	}, [user, router]);

	// Function to fetch tasks
	const fetchTasks = async () => {
		if (user) {
			const q = query(
				collection(db, "tasks"),
				where("managerEmail", "==", user.email) // Only fetch tasks for the logged-in manager
			);
			const taskSnapshot = await getDocs(q);
			setTasks(
				taskSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
			);
		}
	};

	const handleAddTask = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent the default form submission behavior
		try {
			if (user && user.role === "manager") {
				await addDoc(collection(db, "tasks"), {
					name: newTask.name,
					description: newTask.description,
					managerEmail: user.email,
					agentEmail: newTask.agentEmail,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});
				// Reset the newTask state after adding the task
				setNewTask({ name: "", description: "", agentEmail: "" });
				setError("");

				// Fetch tasks again to update the task list
				fetchTasks();
			}
		} catch (error) {
			console.error("Error adding task:", error);
			setError("Failed to add task. Please try again.");
		}
	};

	return (
		<div>
			<h1>Tasks</h1>
			{user && user.role === "manager" && (
				<form onSubmit={handleAddTask}>
					<h3>Add New Task</h3>
					<label>
						Name:
						<input
							type="text"
							value={newTask.name}
							onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
							required
						/>
					</label>
					<br />
					<label>
						Description:
						<textarea
							value={newTask.description}
							onChange={(e) =>
								setNewTask({ ...newTask, description: e.target.value })
							}
							required
						></textarea>
					</label>
					<br />
					<label>
						Agent Email:
						<input
							type="email"
							value={newTask.agentEmail}
							onChange={(e) =>
								setNewTask({ ...newTask, agentEmail: e.target.value })
							}
							required
						/>
					</label>
					<br />
					<button type="submit">Add Task</button>
				</form>
			)}

			<h2>Task List</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>Agent Email</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map((task) => (
						<tr key={task.id}>
							<td>{task.name}</td>
							<td>{task.description}</td>
							<td>{task.agentEmail}</td>
							<td>{task.status}</td>
						</tr>
					))}
				</tbody>
			</table>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default TasksPage;
