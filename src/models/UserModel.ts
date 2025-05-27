export interface UserModel {
  _id?: string; // Optional for new users
  fullName: string;
  email: string;
  password?: string; // Optional if user is already registered
  role: 'Admin' | 'Super Admin' | 'User' | 'Doctor';
  phone?: string;
  address?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  dateJoined?: string; // ISO date string
  lastActive?: string; // ISO date string
  department?: string;
  position?: string;
  permissions?: string[];
  createdAt?: string; // from timestamps
  updatedAt?: string; // from timestamps
}
