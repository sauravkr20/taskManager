// src/app/tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
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

	useEffect(() => {
		const fetchTasks = async () => {
			if (user) {
				const q = query(
					collection(db, "tasks"),
					where(
						user.role === "manager" ? "managerEmail" : "agentEmail",
						"==",
						user.email
					)
				);
				const taskSnapshot = await getDocs(q);
				setTasks(
					taskSnapshot.docs.map(
						(doc) => ({ id: doc.id, ...doc.data() } as Task)
					)
				);
			}
		};

		fetchTasks();
	}, [user]);

	const handleAddTask = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (user) {
				await addDoc(collection(db, "tasks"), {
					name: newTask.name,
					description: newTask.description,
					managerEmail: user.role === "manager" ? user.email : "",
					agentEmail: user.role === "agent" ? user.email : newTask.agentEmail,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
					status: "Pending",
				});
				setNewTask({ name: "", description: "", agentEmail: "" });
				setError("");
			}
		} catch (error) {
			console.error("Error adding task:", error);
			setError("Failed to add task. Please try again.");
		}
	};

	return (
		<div>
			<h1>{user?.role === "manager" ? "Manager's" : "Agent's"} Tasks</h1>
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
				{user?.role === "agent" && (
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
				)}
				<br />
				<button type="submit">Add Task</button>
				{error && <p style={{ color: "red" }}>{error}</p>}
			</form>

			<h2>Task List</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>Agent Email</th>
						<th>Status</th>
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
		</div>
	);
};

export default TasksPage;
