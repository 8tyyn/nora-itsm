import { UserModel } from '@/models/UserModel';

export class DoctorService {
  private static host = 'http://localhost:5000/api';

  /**
   * Get all doctors with pagination, search and filters
   */
  public static getAll = async (
    token: string,
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    specialty?: string,
    status?: string
  ): Promise<UserModel[]> => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (search) params.append('search', search);
      if (specialty) params.append('specialty', specialty);
      if (status) params.append('status', status);

      const data = await fetch(
        `${this.host}/users/doctors?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return (await data.json()) as UserModel[];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  public static addDoctor = async (
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
      const response = await fetch(`${this.host}/users/doctor/add`, {
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

  /**
   * Get doctor by ID
   */
  public static getById = async (
    token: string,
    id: string
  ): Promise<UserModel | null> => {
    try {
      const data = await fetch(`${this.host}/doctors/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return (await data.json()) as UserModel;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /**
   * Create a new doctor
   */
  public static create = async (
    token: string,
    doctorData: {
      fullName: string;
      email: string;
      password: string;
      specialty?: string;
      qualifications?: string[];
      bio?: string;
      phone?: string;
    }
  ): Promise<{ doctorId: string; userId: string; message: string } | null> => {
    try {
      const data = await fetch(`${this.host}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(doctorData)
      });

      return await data.json();
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /**
   * Delete (deactivate) a doctor
   */
  public static delete = async (
    token: string,
    id: string
  ): Promise<{ message: string } | null> => {
    try {
      const data = await fetch(`${this.host}/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return await data.json();
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /**
   * Get doctor statistics
   */
}
