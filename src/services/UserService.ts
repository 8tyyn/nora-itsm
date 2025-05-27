import { UserModel } from '@/models/UserModel';

export class UserService {
  private static host = 'http://localhost:5000/api';

  public static register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
    status?: string;
    dateJoined?: string;
    lastActive?: string;
    department?: string;
    position?: string;
    permissions?: string[];
  }) => {
    try {
      const response = await fetch(`${this.host}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      // Store token if returned
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  public static getAllActive = async (token: string) => {
    try {
      const data = await fetch(`${this.host}/users/active`, {
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

  public static getAllPending = async (token: string) => {
    try {
      const data = await fetch(`${this.host}/users/pending`, {
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

  public static getAllBlocked = async (token: string) => {
    try {
      const data = await fetch(`${this.host}/users/blocked`, {
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

  public static getBlockedAdmins = async (token: string) => {
    try {
      const data = await fetch(`${this.host}/users/blocked/admins`, {
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

  public static login = async (email: string, password: string) => {
    try {
      const data = await fetch(`${this.host}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      });
      const result = await data.json();
      localStorage.setItem('token', result.token);
      return result.token;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public static logout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        // Call the server-side logout endpoint
        const response = await fetch(`${this.host}/users/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Even if the server request fails, we still want to remove the token
        if (!response.ok) {
          console.warn(
            'Server-side logout failed, but proceeding with client-side logout'
          );
        }
      }

      // Remove the token from local storage
      localStorage.removeItem('token');

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if there was an error
      localStorage.removeItem('token');
      return false;
    }
  };

  public static updateUserStatus = async (
    userId: string,
    status: string,
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update status to ${status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating user status to ${status}:`, error);
      throw error;
    }
  };

  public static addUser = async (
    userData: {
      fullName: string;
      email: string;
      password: string;
      role: string;
      phone?: string;
      address?: string;
    },
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/users/users/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  public static getUserById = async (userId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/users/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  };

  public static getUserByIdUser = async (userId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/users/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  };

  public static updateUser = async (
    userId: string,
    userData: Partial<UserModel>,
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  public static deleteUser = async (userId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  public static updateUserProfile = async (
    userData: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      department?: string;
      position?: string;
      currentPassword?: string;
      password?: string;
    },
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return (await response.json()) as UserModel;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  public static getUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${this.host}/users/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user profile');
      }

      return (await response.json()) as UserModel;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  // Add this method to your UserService class

  public static searchUsers = async (
    searchTerm: string,
    token: string,
    options: {
      page?: number;
      pageSize?: number;
      role?: string;
    } = {}
  ) => {
    try {
      const { page = 1, pageSize = 10, role } = options;
      let queryParams = `?q=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`;

      if (role) {
        queryParams += `&role=${role}`;
      }

      const response = await fetch(`${this.host}/users/search${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };
}
