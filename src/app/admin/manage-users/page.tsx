// src/app/admin/manage-users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebase/clientApp";
import { collection, getDocs } from "firebase/firestore";
import { Manager, Agent } from "@/types/users";
import ManagerList from "./ManagerList";
import AgentList from "./AgentList";
import AddManagerForm from "./AddManagerForm";
import AddAgentForm from "./AddAgentForm";

const ManageUsersPage = () => {
	const [managers, setManagers] = useState<Manager[]>([]);
	const [agents, setAgents] = useState<Agent[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			const managerSnapshot = await getDocs(collection(db, "managers"));
			setManagers(
				managerSnapshot.docs.map(
					(doc) => ({ id: doc.id, ...doc.data() } as Manager)
				)
			);

			const agentSnapshot = await getDocs(collection(db, "agents"));
			setAgents(
				agentSnapshot.docs.map(
					(doc) => ({ id: doc.id, ...doc.data() } as Agent)
				)
			);
		};

		fetchUsers();
	}, []);

	const refreshUsers = async () => {
		const managerSnapshot = await getDocs(collection(db, "managers"));
		setManagers(
			managerSnapshot.docs.map(
				(doc) => ({ id: doc.id, ...doc.data() } as Manager)
			)
		);

		const agentSnapshot = await getDocs(collection(db, "agents"));
		setAgents(
			agentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Agent))
		);
	};

	return (
		<div>
			<h1>Manage Users</h1>
			<ManagerList managers={managers} />
			<AddManagerForm onManagerAdded={refreshUsers} />
			<AgentList agents={agents} />
			<AddAgentForm onAgentAdded={refreshUsers} />
		</div>
	);
};

export default ManageUsersPage;
