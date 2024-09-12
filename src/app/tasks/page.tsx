// src/app/tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase/clientApp";
import {
	collection,
	getDocs,
	query,
	where,
	addDoc,
	serverTimestamp,
	updateDoc,
	doc,
	deleteDoc,
	writeBatch, 
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/userSlice"; // Adjust the import path as necessary
import { RootState } from "@/store/store";
import { Task } from "@/types/users";
import Papa from "papaparse";

const TasksPage = () => {
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user.user);
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
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
	const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.push("/login");
		} else {
			fetchTasks();
		}
	}, [user, router]);

	const fetchTasks = async () => {
		if (user) {
			const q = query(
				collection(db, "tasks"),
				where("managerEmail", "==", user.email)
			);
			const taskSnapshot = await getDocs(q);
			setTasks(
				taskSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
			);
		}
	};

	const handleAddTask = async (e: React.FormEvent) => {
		e.preventDefault();
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
				setNewTask({ name: "", description: "", agentEmail: "" });
				setError("");
				fetchTasks();
				setIsModalOpen(false);
			}
		} catch (error) {
			console.error("Error adding task:", error);
			setError("Failed to add task. Please try again.");
		}
	};

	const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				complete: async (results: { data: Task[] }) => {
					try {
						const tasksToAdd = results.data.map((row: Task) => ({
							name: row.name,
							description: row.description,
							agentEmail: row.agentEmail,
							managerEmail: user!.email,
							createdAt: serverTimestamp(),
							updatedAt: serverTimestamp(),
						}));

						const batch = writeBatch(db); // Create a new batch instance
						tasksToAdd.forEach((task) => {
							const taskRef = doc(collection(db, "tasks")); // Create a new document reference
							batch.set(taskRef, task); // Add the task to the batch
						});
						await batch.commit(); // Commit all operations in the batch
						fetchTasks(); // Refresh the task list after uploading
					} catch (error) {
						console.error("Error uploading tasks:", error);
						setError("Failed to upload tasks. Please try again.");
					}
				},
			});
		}
	};

	const handleLogout = () => {
		dispatch(setUser(null)); // Clear user data from Redux store
		router.push("/login"); // Redirect to login page
	};

	const handleEditTask = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (currentTaskId) {
				const taskRef = doc(db, "tasks", currentTaskId);
				const updatedFields: Partial<Task> = {
					status: currentTask.status, // Only update status for agents
				};

				// Allow managers to update all fields
				if (user?.role === "manager") {
					updatedFields.name = currentTask.name;
					updatedFields.description = currentTask.description;
					updatedFields.agentEmail = currentTask.agentEmail;
				}

				await updateDoc(taskRef, {
					...updatedFields,
					updatedAt: serverTimestamp(),
				});
				setCurrentTaskId(null);
				setCurrentTask({});
				setError("");
				fetchTasks();
				setIsEditModalOpen(false);
			}
		} catch (error) {
			console.error("Error updating task:", error);
			setError("Failed to update task. Please try again.");
		}
	};

	const openEditModal = (task: Task) => {
		setCurrentTaskId(task.id);
		setCurrentTask({
			name: task.name,
			description: task.description,
			agentEmail: task.agentEmail,
			status: task.status, // Assuming there's a status field
		});
		setIsEditModalOpen(true);
	};

	// Function to delete a task
	const handleDeleteTask = async (taskId: string) => {
		if (confirm("Are you sure you want to delete this task?")) {
			try {
				await deleteDoc(doc(db, "tasks", taskId));
				fetchTasks(); // Refresh the task list after deletion
			} catch (error) {
				console.error("Error deleting task:", error);
				setError("Failed to delete task. Please try again.");
			}
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Tasks</h1>
			<label className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md cursor-pointer mb-4">
				Upload CSV
				<input
					type="file"
					accept=".csv"
					onChange={handleCSVUpload}
					className="hidden" // Hide the file input
				/>
			</label>
			<button
				onClick={handleLogout}
				className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
			>
				Logout
			</button>
			{user && user.role === "manager" && (
				<>
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-4"
					>
						Add New Task
					</button>

					{isModalOpen && (
						<div className="fixed inset-0 flex items-center justify-center z-50">
							<div
								className="modal-overlay fixed inset-0 bg-black opacity-50"
								onClick={() => setIsModalOpen(false)}
							/>
							<div className="modal-content bg-white rounded-lg shadow-md p-6 z-10">
								<h3 className="text-xl font-semibold mb-4">Add New Task</h3>
								<form onSubmit={handleAddTask}>
									<div className="mb-4">
										<label className="block font-medium mb-1">Name:</label>
										<input
											type="text"
											value={newTask.name}
											onChange={(e) =>
												setNewTask({ ...newTask, name: e.target.value })
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										/>
									</div>
									<div className="mb-4">
										<label className="block font-medium mb-1">
											Description:
										</label>
										<textarea
											value={newTask.description}
											onChange={(e) =>
												setNewTask({ ...newTask, description: e.target.value })
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										></textarea>
									</div>
									<div className="mb-4">
										<label className="block font-medium mb-1">
											Agent Email:
										</label>
										<input
											type="email"
											value={newTask.agentEmail}
											onChange={(e) =>
												setNewTask({ ...newTask, agentEmail: e.target.value })
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										/>
									</div>
									<div className="flex justify-end">
										<button
											type="button"
											className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md mr-2"
											onClick={() => setIsModalOpen(false)}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
										>
											Add Task
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</>
			)}

			<h2 className="text-2xl font-semibold mb-4">Task List</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
					<thead className="bg-gray-200">
						<tr>
							<th className="py-2 px-4 border-b">Name</th>
							<th className="py-2 px-4 border-b">Description</th>
							<th className="py-2 px-4 border-b">
								{user?.role === "manager" ? "Agent Email" : "Manager Email"}
							</th>
							<th className="py-2 px-4 border-b">Actions</th>
						</tr>
					</thead>
					<tbody>
						{tasks.map((task) => (
							<tr key={task.id} className="hover:bg-gray-100">
								<td className="py-2 px-4 border-b">{task.name}</td>
								<td className="py-2 px-4 border-b">{task.description}</td>
								<td className="py-2 px-4 border-b">
									{user?.role === "manager"
										? task.agentEmail
										: task.managerEmail}
								</td>
								<td className="py-2 px-4 border-b flex space-x-2">
									<button
										onClick={() => openEditModal(task)}
										className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-2 rounded-md"
									>
										Edit
									</button>
									{user?.role === "manager" && (
										<button
											onClick={() => handleDeleteTask(task.id)}
											className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md"
										>
											Delete
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{error && <p className="text-red-500 mt-4 font-medium">{error}</p>}

			{/* Edit Modal */}
			{isEditModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div
						className="modal-overlay fixed inset-0 bg-black opacity-50"
						onClick={() => setIsEditModalOpen(false)}
					/>
					<div className="modal-content bg-white rounded-lg shadow-md p-6 z-10">
						<h3 className="text-xl font-semibold mb-4">Edit Task</h3>
						<form onSubmit={handleEditTask}>
							{user?.role === "manager" && (
								<>
									<div className="mb-4">
										<label className="block font-medium mb-1">Name:</label>
										<input
											type="text"
											value={currentTask.name}
											onChange={(e) =>
												setCurrentTask({ ...currentTask, name: e.target.value })
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										/>
									</div>
									<div className="mb-4">
										<label className="block font-medium mb-1">
											Description:
										</label>
										<textarea
											value={currentTask.description}
											onChange={(e) =>
												setCurrentTask({
													...currentTask,
													description: e.target.value,
												})
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										></textarea>
									</div>
									<div className="mb-4">
										<label className="block font-medium mb-1">
											Agent Email:
										</label>
										<input
											type="email"
											value={currentTask.agentEmail}
											onChange={(e) =>
												setCurrentTask({
													...currentTask,
													agentEmail: e.target.value,
												})
											}
											required
											className="border border-gray-300 rounded-md px-4 py-2 w-full"
										/>
									</div>
								</>
							)}
							<div className="mb-4">
								<label className="block font-medium mb-1">Status:</label>
								<select
									value={currentTask.status || ""}
									onChange={(e) =>
										setCurrentTask({ ...currentTask, status: e.target.value })
									}
									className="border border-gray-300 rounded-md px-4 py-2 w-full"
								>
									<option value="">Select Status</option>
									<option value="pending">Pending</option>
									<option value="in-progress">In Progress</option>
									<option value="completed">Completed</option>
								</select>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md mr-2"
									onClick={() => setIsEditModalOpen(false)}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
								>
									Update Task
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default TasksPage;
