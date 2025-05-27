'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MessageService } from '@/services/MessageService';

// Types for the backend response
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface BackendMessage {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  attachments: any[];
  read: boolean;
  subject: string;
  isArchived: boolean;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BackendResponse {
  messages: BackendMessage[];
  page: number;
  pages: number;
  total: number;
  user: User;
}

// Transformed types for display
interface DisplayMessage {
  id: string;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
  senderInfo: User;
}

interface DisplayConversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  messages: DisplayMessage[];
  otherUser: User;
}

export default function ConversationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<DisplayConversation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to format timestamp
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Transform backend response to display format
  const transformBackendResponse = (
    backendData: BackendResponse
  ): DisplayConversation | null => {
    if (!backendData.messages || backendData.messages.length === 0) {
      return null;
    }

    const otherUser = backendData.user;

    // Find the other user (the one we're chatting with)
    const firstMessage = backendData.messages[0];
    const currentUser =
      firstMessage.sender._id === otherUser._id
        ? firstMessage.recipient
        : firstMessage.sender;

    // Transform messages
    const transformedMessages: DisplayMessage[] = backendData.messages.map(
      (msg) => ({
        id: msg._id,
        sender: msg.sender._id === currentUser._id ? 'me' : 'them',
        content: msg.content,
        timestamp: formatTimestamp(msg.createdAt),
        senderInfo: msg.sender
      })
    );

    // Sort messages by creation date (oldest first)
    transformedMessages.sort(
      (a, b) =>
        new Date(
          backendData.messages.find((m) => m._id === a.id)!.createdAt
        ).getTime() -
        new Date(
          backendData.messages.find((m) => m._id === b.id)!.createdAt
        ).getTime()
    );

    // Determine online status and last seen (you might want to get this from another API)
    const lastMessage = backendData.messages[backendData.messages.length - 1];
    const isOnline = false; // You'll need to implement this based on your backend
    const lastSeen = `Last seen ${formatTimestamp(lastMessage.updatedAt)}`;

    return {
      id: otherUser._id,
      name: otherUser.fullName,
      avatar: `/placeholder.svg?height=40&width=40`, // Replace with actual avatar URL if available
      online: isOnline,
      lastSeen: lastSeen,
      messages: transformedMessages,
      otherUser: otherUser
    };
  };

  const getAllConversationMessages = async (id: string, token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data: BackendResponse = await MessageService.getConversation(
        id,
        token
      );
      const transformedConversation = transformBackendResponse(data);
      setConversation(transformedConversation);
    } catch (err) {
      setError('Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    params.then(({ id }) => {
      getAllConversationMessages(id, token);
    });
  }, [params]);

  useEffect(() => {
    // Scroll to bottom of messages when conversation changes or new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    try {
      // Here you would call your API to send the message
      // const response = await MessageService.sendMessage(conversation.id, newMessage, token)

      // For now, we'll just add it locally
      // Get current user from localStorage or however you store it
      const token = localStorage.getItem('token')!;

      const newMsg: DisplayMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        sender: 'me',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        senderInfo: conversation.otherUser // This will be fixed when we get the actual current user
      };

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, newMsg]
      };

      setConversation(updatedConversation);
      MessageService.sendMessage(
        { recipient: conversation.otherUser._id, content: newMsg.content },
        token
      );
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Handle error (show toast, etc.)
    }
  };

  if (loading) {
    return (
      <div className='flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border bg-white'>
        <div className='text-center'>
          <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-500'>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border bg-white'>
        <div className='text-center'>
          <p className='mb-2 text-red-600'>{error}</p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border bg-white'>
        <p className='text-gray-500'>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className='flex h-[calc(100vh-8rem)] flex-col rounded-lg border bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            asChild
            className='mr-1 hover:bg-blue-50'
          >
            <Link href='/messages'>
              <ArrowLeft className='h-4 w-4 text-blue-600' />
              <span className='sr-only'>Back to messages</span>
            </Link>
          </Button>
          <div className='relative'>
            <Avatar>
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback className='bg-blue-100 text-blue-700'>
                {conversation.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.online && (
              <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white' />
            )}
          </div>
          <div>
            <h2 className='font-medium'>{conversation.name}</h2>
            <p className='text-muted-foreground text-xs'>
              {conversation.lastSeen}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
          >
            <Phone className='h-4 w-4' />
            <span className='sr-only'>Call</span>
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
          >
            <Video className='h-4 w-4' />
            <span className='sr-only'>Video call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
              >
                <MoreVertical className='h-4 w-4' />
                <span className='sr-only'>More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Search in conversation</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                Block user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='space-y-4'>
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender !== 'me' && (
                <Avatar className='mr-2 h-8 w-8'>
                  <AvatarImage
                    src={conversation.avatar}
                    alt={conversation.name}
                  />
                  <AvatarFallback className='bg-blue-100 text-blue-700'>
                    {conversation.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`mt-1 text-right text-xs ${
                    message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='border-t p-4'>
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
          >
            <Paperclip className='h-4 w-4' />
            <span className='sr-only'>Attach file</span>
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Type a message...'
            className='flex-1'
          />
          <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
            <Send className='h-4 w-4' />
            <span className='sr-only'>Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
