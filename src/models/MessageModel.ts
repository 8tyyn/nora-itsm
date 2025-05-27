export interface MessageModel {
  senderDetails: any;
  _id?: string; // Optional for new messages
  sender: string; // ObjectId as string
  recipient?: string; // Optional for broadcast messages
  content: string;
  attachments?: string[]; // Optional array of file paths or URLs
  read?: boolean; // Defaults to false
  subject?: string;
  isArchived?: boolean; // Defaults to false
  isImportant?: boolean; // Defaults to false
  createdAt?: string; // ISO date string from timestamps
  updatedAt?: string; // ISO date string from timestamps
}
