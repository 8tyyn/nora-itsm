import { MessageModel } from '@/models/MessageModel';

export class MessageService {
  private static host = 'http://localhost:5000/api';

  /**
   * Send a new message
   * @param messageData - The message data to send
   * @param token - Authentication token
   * @returns Promise with the created message
   */
  public static sendMessage = async (
    messageData: {
      recipient?: string;
      content: string;
      subject?: string;
      attachments?: string[];
    },
    token: string
  ) => {
    try {
      const response = await fetch(`${this.host}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  /**
   * Get user's inbox (received messages)
   * @param token - Authentication token
   * @param options - Pagination and filter options
   * @returns Promise with paginated inbox messages
   */
  public static getInbox = async (
    token: string,
    options: {
      page?: number;
      pageSize?: number;
      unread?: boolean;
    } = {}
  ) => {
    try {
      const { page = 1, pageSize = 10, unread } = options;
      let queryParams = `?page=${page}&pageSize=${pageSize}`;

      if (unread !== undefined) {
        queryParams += `&unread=${unread}`;
      }

      const response = await fetch(
        `${this.host}/messages/inbox${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve inbox');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting inbox:', error);
      throw error;
    }
  };

  /**
   * Get user's sent messages
   * @param token - Authentication token
   * @param options - Pagination options
   * @returns Promise with paginated sent messages
   */
  public static getSentMessages = async (
    token: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    try {
      const { page = 1, pageSize = 10 } = options;
      const queryParams = `?page=${page}&pageSize=${pageSize}`;

      const response = await fetch(`${this.host}/messages/sent${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to retrieve sent messages'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting sent messages:', error);
      throw error;
    }
  };

  /**
   * Get conversation with another user
   * @param userId - ID of the user to get conversation with
   * @param token - Authentication token
   * @param options - Pagination options
   * @returns Promise with paginated conversation messages
   */
  public static getConversation = async (
    userId: string,
    token: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    try {
      const { page = 1, pageSize = 20 } = options;
      const queryParams = `?page=${page}&pageSize=${pageSize}`;

      const response = await fetch(
        `${this.host}/messages/conversation/${userId}${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  };

  /**
   * Get message by ID
   * @param messageId - ID of the message to retrieve
   * @param token - Authentication token
   * @returns Promise with the message data
   */
  public static getMessageById = async (messageId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/${messageId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve message');
      }

      return (await response.json()) as MessageModel;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  };

  /**
   * Mark message as read
   * @param messageId - ID of the message to mark as read
   * @param token - Authentication token
   * @returns Promise with the updated message
   */
  public static markAsRead = async (messageId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark message as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  /**
   * Mark all messages as read
   * @param token - Authentication token
   * @returns Promise with the result
   */
  public static markAllAsRead = async (token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/read/all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to mark all messages as read'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
  };

  /**
   * Delete a message
   * @param messageId - ID of the message to delete
   * @param token - Authentication token
   * @returns Promise with the result
   */
  public static deleteMessage = async (messageId: string, token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  /**
   * Get unread message count
   * @param token - Authentication token
   * @returns Promise with the unread count
   */
  public static getUnreadCount = async (token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/stats/unread`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get unread count');
      }

      const result = await response.json();
      return result.unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  };

  /**
   * Get message statistics (Admin only)
   * @param token - Authentication token (must be admin)
   * @returns Promise with the message statistics
   */
  public static getMessageStats = async (token: string) => {
    try {
      const response = await fetch(`${this.host}/messages/stats/admin`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to get message statistics'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting message statistics:', error);
      throw error;
    }
  };

  /**
   * Search messages (Admin only)
   * @param token - Authentication token (must be admin)
   * @param options - Search options
   * @returns Promise with the search results
   */
  public static searchMessages = async (
    token: string,
    options: {
      q?: string;
      userId?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    try {
      const { q = '', userId, page = 1, pageSize = 10 } = options;
      let queryParams = `?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;

      if (userId) {
        queryParams += `&userId=${userId}`;
      }

      const response = await fetch(
        `${this.host}/messages/search/admin${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  };
}
