// src/types/UserTypes.ts

export interface Manager {
	id?: string; // Optional, will be populated from Firestore
	email: string;
	name: string;
	password: string;
	createdAt?: Date; // Optional, can be set when adding a manager
	updatedAt?: Date; // Optional, can be set when updating a manager
}

export interface Agent {
	id?: string; // Optional, will be populated from Firestore
	email: string;
	password: string;
	name: string;
	managerId: string; // Reference to the associated manager
	createdAt?: Date; // Optional
	updatedAt?: Date; // Optional
}

export interface Task {
	id: string;
	name: string;
	description: string;
	managerEmail: string;
	agentEmail: string;
	agentComment?: string;
	createdAt?: Date;
	updatedAt?: Date;
	status: string;
}
