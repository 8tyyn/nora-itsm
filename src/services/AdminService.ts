import { UserModel } from '@/models/UserModel';
export class AdminService {
  private static host = 'http://localhost:5000/api';

  public static getAll = async (token: string) => {
    try {
      const data = await fetch(`${this.host}/users/admins`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const users = await data.json();
      return users as UserModel[];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  public static addAdmin = async (
    token: string,
    adminData: {
      fullName: string;
      email: string;
      password: string;
      role: 'Admin' | 'Super Admin';
      phone?: string;
      address?: string;
    }
  ) => {
    try {
      const response = await fetch(`${this.host}/users/admin/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add administrator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  };

  /**
   * Update an admin user's information
   * @param adminId The ID of the admin to update
   * @param adminData The updated admin data
   * @param token Authentication token
   */
  public static updateAdmin = async (
    adminId: string,
    adminData: {
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
      address?: string;
      department?: string;
      position?: string;
      permissions?: string[];
    },
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/users/admin/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update administrator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  };

  /**
   * Block or unblock an admin user
   * @param adminId The ID of the admin to block/unblock
   * @param token Authentication token
   */
  public static blockAdmin = async (adminId: string, token: string) => {
    try {
      const response = await fetch(
        `${this.host}/users/admin/${adminId}/block`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to block administrator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error blocking admin:', error);
      throw error;
    }
  };

  /**
   * Delete an admin user
   * @param adminId The ID of the admin to delete
   * @param token Authentication token
   */
  public static deleteAdmin = async (adminId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/users/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete administrator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  };
}
