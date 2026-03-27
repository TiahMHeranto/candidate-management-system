// src/types/index.ts
export interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  status: 'pending' | 'validated';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

// src/types/candidate.ts
export interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string;
}