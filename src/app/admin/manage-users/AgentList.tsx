// src/app/admin/manage-users/AgentList.tsx

"use client";

import { Agent } from "@/types/users";

interface AgentListProps {
	agents: Agent[];
}

const AgentList: React.FC<AgentListProps> = ({ agents }) => {
	return (
		<div>
			<h2>Agents</h2>
			<ul>
				{agents.map((agent) => (
					<li key={agent.id}>
						{agent.name} ({agent.email})
					</li>
				))}
			</ul>
		</div>
	);
};

export default AgentList;
