"use client";

import { Manager } from "@/types/users";

interface ManagerListProps {
	managers: Manager[];
}

const ManagerList: React.FC<ManagerListProps> = ({ managers }) => {
	return (
		<div>
			<h2>Managers</h2>
			<ul>
				{managers.map((manager) => (
					<li key={manager.id}>
						{manager.name} ({manager.email})
					</li>
				))}
			</ul>
		</div>
	);
};

export default ManagerList;
