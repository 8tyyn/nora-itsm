'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { MessageService } from '@/services/MessageService';
import { UserService } from '@/services/UserService';
import { UserModel } from '@/models/UserModel';
import { Search, User, CheckCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<
    {
      userId: string;
      fullName: string;
      lastMessageAt: string;
      unreadCount: number;
      lastMessageContent: string;
    }[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const getInbox = async (token: string) => {
    const data = await MessageService.getInbox(token);
    setConversations(data);
  };

  const searchUsers = async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token')!;
      const response = await UserService.searchUsers(term, token, {
        pageSize: 20
      });
      setSearchResults(response.users || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const token = localStorage.getItem('token')!;
      await MessageService.markAllAsRead(token);

      // Refresh the page data
      await getInbox(token);

      // Optional: Show success message or toast notification here
      console.log('All messages marked as read successfully');
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      // Optional: Show error message or toast notification here
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token')!;
    getInbox(token);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchTerm.trim().length >= 2) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Messages</h1>
        {totalUnreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
            variant='outline'
            className='flex items-center gap-2'
          >
            {isMarkingAllRead ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <CheckCheck className='h-4 w-4' />
            )}
            {isMarkingAllRead ? 'Marking as read...' : 'Mark All as Read'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            Manage your messages and conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative mb-4'>
            <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
            <Input
              placeholder='Search users...'
              className='pl-9'
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className='absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg'>
                {isSearching ? (
                  <div className='text-muted-foreground p-3 text-center'>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className='py-2'>
                    {searchResults.map((user) => (
                      <Link
                        key={user._id}
                        href={`/messages/profile/${user._id}`}
                        className='flex items-center gap-3 px-3 py-2 transition-colors hover:bg-gray-50'
                        onClick={clearSearch}
                      >
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback className='bg-blue-100 text-sm text-blue-700'>
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <div className='text-sm font-medium'>
                            {user.fullName}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {user.email}
                          </div>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          {user.role}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : searchTerm.trim().length >= 2 ? (
                  <div className='text-muted-foreground p-3 text-center'>
                    No users found matching "{searchTerm}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Existing Conversations */}
          <div className='space-y-2'>
            {conversations.length > 0 ? (
              conversations.map((conversation, index) => (
                <Link
                  key={index}
                  href={`/messages/${conversation.userId}`}
                  className='block'
                >
                  <div className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-blue-50'>
                    <div className='relative'>
                      <Avatar>
                        <AvatarFallback className='bg-blue-100 text-blue-700'>
                          {conversation.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className='flex-1 overflow-hidden'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-medium'>{conversation.fullName}</h3>
                        <span className='text-muted-foreground text-xs'>
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className='text-muted-foreground truncate text-sm'>
                        {conversation.lastMessageContent}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge className='ml-2 bg-blue-600'>
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className='text-muted-foreground py-8 text-center'>
                <User className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No conversations yet</p>
                <p className='text-sm'>
                  Use the search above to find users and start a conversation
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
