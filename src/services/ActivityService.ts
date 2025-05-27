import {
  ActivityModel,
  ActivityLogResponse,
  PopulatedActivityModel
} from '@/models/ActivityModel';

export class ActivityService {
  private static host = 'http://localhost:5000/api';

  // Get all activity logs (admin only) with pagination and filters
  public static getActivityLogs = async (
    token: string,
    options: {
      page?: number;
      pageSize?: number;
      userId?: string;
      action?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        userId,
        action,
        dateFrom,
        dateTo
      } = options;

      let queryParams = `?page=${page}&pageSize=${pageSize}`;

      if (userId) queryParams += `&userId=${userId}`;
      if (action) queryParams += `&action=${encodeURIComponent(action)}`;
      if (dateFrom) queryParams += `&dateFrom=${dateFrom}`;
      if (dateTo) queryParams += `&dateTo=${dateTo}`;

      const response = await fetch(`${this.host}/activity-logs${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get activity logs');
      }

      return (await response.json()) as ActivityLogResponse;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  };

  // Get user's activity logs
  public static getUserActivityLogs = async (
    userId: string,
    token: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    try {
      const { page = 1, pageSize = 10 } = options;

      const queryParams = `?page=${page}&pageSize=${pageSize}`;

      const response = await fetch(
        `${this.host}/activity-logs/user/${userId}${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to get user activity logs'
        );
      }

      return (await response.json()) as ActivityLogResponse;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      throw error;
    }
  };

  // Get recent activity
  public static getRecentActivity = async (token: string) => {
    try {
      const response = await fetch(`${this.host}/activity-logs/recent`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get recent activity');
      }

      return (await response.json()) as PopulatedActivityModel[];
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  };

  // Create activity log (internal method for logging activities)
  public static createActivityLog = async (
    activityData: {
      userId: string;
      action: string;
      details?: string;
    },
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/activity-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create activity log');
      }

      return (await response.json()) as ActivityModel;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  };

  // Get activity statistics (could be useful for admin dashboard)
  public static getActivityStats = async (
    token: string,
    options: {
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) => {
    try {
      const { dateFrom, dateTo } = options;

      let queryParams = '';
      if (dateFrom || dateTo) {
        queryParams = '?';
        if (dateFrom) queryParams += `dateFrom=${dateFrom}`;
        if (dateTo) queryParams += `${dateFrom ? '&' : ''}dateTo=${dateTo}`;
      }

      const response = await fetch(
        `${this.host}/activity-logs/stats${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to get activity statistics'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      throw error;
    }
  };
}
