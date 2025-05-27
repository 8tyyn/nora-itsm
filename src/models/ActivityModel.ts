export interface ActivityModel {
  _id?: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string; // ISO date string
  createdAt?: string; // from timestamps
  updatedAt?: string; // from timestamps
}

export interface PopulatedActivityModel extends Omit<ActivityModel, 'userId'> {
  userId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface ActivityLogResponse {
  activityLogs: PopulatedActivityModel[]; // Updated to match the actual API response
  page: number;
  pages: number;
  total: number;
}
