import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { messageHubService } from '../../services/messageHubService';
import { activeChatTracker } from '../../services/activeChatTracker';
import { useAuth } from '../../context/AuthContext';
import {
  Loader2,
  Send,
  Search,
  Circle,
  User as UserIcon,
  MessageSquare,
  Check,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Contact, MessageEvent, Message } from '../../types';

const Messages: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadContacts, setUnreadContacts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Register active chat page with global tracker
  useEffect(() => {
    activeChatTracker.setChatPageOpen(true);
    return () => {
      activeChatTracker.setChatPageOpen(false);
    };
  }, []);

  // Update active contact in tracker
  useEffect(() => {
    activeChatTracker.setActiveContact(selectedContact?.id || null);
    if (selectedContact?.id) {
      // Clear unread count for the active contact
      setUnreadContacts((prev) => ({ ...prev, [selectedContact.id]: 0 }));
    }
  }, [selectedContact]);

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', user?.id, user?.role],
    queryFn: () => messageService.getContacts(),
    retry: 1,
    enabled: !!isAuthenticated,
  });

  const contacts: Contact[] = useMemo(() => {
    if (!contactsData?.data) return [];
    if (Array.isArray(contactsData.data)) return contactsData.data;
    if (Array.isArray((contactsData.data as any).items)) return (contactsData.data as any).items;
    return [];
  }, [contactsData]);

  // Handle initial contact selection from URL query params or auto-select first
  useEffect(() => {
    if (contacts.length === 0 || selectedContact) return;
    const targetId = searchParams.get('contactId') || searchParams.get('userId');
    if (targetId) {
      const match = contacts.find((c) => String(c.id).toLowerCase() === targetId.toLowerCase());
      if (match) {
        setSelectedContact(match);
        return;
      }
    }
  }, [contacts, searchParams, selectedContact]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      (contact?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  // Mark all unread messages from a contact as read
  const markConversationAsRead = useCallback(
    (contactId: string, messagesList: Message[]) => {
      if (!isAuthenticated || !contactId) return;

      const unread = messagesList.filter(
        (m) => !m.isRead && m.senderId && String(m.senderId).toLowerCase() === String(contactId).toLowerCase()
      );

      unread.forEach((msg) => {
        if (msg.messageId || msg.id) {
          messageHubService.markAsRead(msg.messageId || msg.id, contactId);
        }
      });
    },
    [isAuthenticated]
  );

  // Real-time message listener
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const unsubscribeMessage = messageHubService.onMessageReceived((message: MessageEvent) => {
      if (!isMounted) return;
      const incomingSenderId = message.sender?.senderId;
      const isFromMe = incomingSenderId === user?.id;

      // Check if this message belongs to the current conversation
      const isCurrentConversation =
        selectedContact &&
        (String(incomingSenderId).toLowerCase() === String(selectedContact.id).toLowerCase() || isFromMe);

      if (isCurrentConversation) {
        const newMessage: Message = {
          id: message.id,
          messageId: message.id,
          message: message.content,
          sentAt: message.sentAt,
          isRead: isFromMe ? Boolean(message.isRead) : true,
          senderId: incomingSenderId,
          sender: message.sender,
        };

        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                (m.messageId && m.messageId === newMessage.messageId) ||
                (m.id && m.id === newMessage.id)
            )
          ) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Automatically mark incoming messages as read on backend via SignalR hub
        if (!isFromMe && incomingSenderId) {
          messageHubService.markAsRead(message.id, incomingSenderId);
        }
      } else if (!isFromMe && incomingSenderId) {
        // Message is from another contact while chatting with someone else - update unread counter badge
        setUnreadContacts((prev) => ({
          ...prev,
          [incomingSenderId]: (prev[incomingSenderId] || 0) + 1,
        }));
      }
    });

    // Listen for read receipts when the other user reads our sent messages
    const unsubscribeRead = messageHubService.onReadStatusChanged((isRead: boolean) => {
      if (isRead) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m))
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribeMessage();
      unsubscribeRead();
    };
  }, [isAuthenticated, selectedContact, user?.id, contacts]);

  // Load conversation history when switching contacts
  useEffect(() => {
    if (!selectedContact) {
      setIsOnline(false);
      setMessages([]);
      return;
    }

    // Reset status when switching contacts
    setIsOnline(false);
    setMessages([]);
    setIsLoadingHistory(true);

    let isSubscribed = true;

    const loadHistory = async () => {
      try {
        const response = await messageService.getMessages(selectedContact.id);
        if (!isSubscribed) return;

        let rawItems: any[] = [];
        if (response?.data) {
          if (Array.isArray(response.data)) {
            rawItems = response.data;
          } else if (Array.isArray(response.data.items)) {
            rawItems = response.data.items;
          }
        }

        const normalized: Message[] = rawItems.map((item: any) => ({
          id: item.id ?? item.Id ?? item.messageId ?? item.MessageId ?? Date.now(),
          messageId: item.messageId ?? item.MessageId ?? item.id ?? item.Id,
          message: item.message ?? item.Message ?? item.content ?? item.Content ?? '',
          sentAt: item.sentAt ?? item.SentAt ?? new Date().toISOString(),
          isRead: Boolean(item.isRead ?? item.IsRead ?? false),
          senderId: String(item.senderId ?? item.SenderId ?? item.sender?.senderId ?? item.Sender?.SenderId ?? ''),
          sender: item.sender ?? item.Sender,
        }));

        // Sort ascending by sentAt (oldest first, newest at the bottom)
        normalized.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        // Mark all unread incoming messages as read immediately upon opening
        markConversationAsRead(selectedContact.id, normalized);

        // Update local state marking incoming as read
        const markedNormalized = normalized.map((m) =>
          String(m.senderId).toLowerCase() === String(selectedContact.id).toLowerCase()
            ? { ...m, isRead: true }
            : m
        );

        setMessages(markedNormalized);
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        if (isSubscribed) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    // Subscribe to online status updates scoped to this contact selection
    const unsubscribeOnline = messageHubService.onOnlineStatusChanged((online: boolean) => {
      if (isSubscribed) {
        setIsOnline(online);
      }
    });

    const checkStatus = async () => {
      if (!isSubscribed) return;
      try {
        await messageHubService.checkOnlineStatus(selectedContact.id);
      } catch (err) {
        console.error('Failed to check online status:', err);
      }
    };

    // Query online status immediately
    checkStatus();

    // Query online status periodically while conversation is open
    const interval = setInterval(checkStatus, 5000);

    return () => {
      isSubscribed = false;
      unsubscribeOnline();
      clearInterval(interval);
    };
  }, [selectedContact, markConversationAsRead]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || !selectedContact || isSending) return;

    setIsSending(true);
    try {
      await messageHubService.sendMessage(trimmed, selectedContact.id);
      // Message will appear via the ReceiveMessage SignalR event
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleImageError = (contactId: string) => {
    setImgErrors((prev) => ({ ...prev, [contactId]: true }));
  };

  if (!isAuthenticated || contactsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <div className="overflow-hidden max-w-7xl w-full h-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col md:flex-row">
          {/* Contacts Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No contacts found</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    {user?.role === 'provider'
                      ? 'Students enrolled in your courses will appear here.'
                      : 'Instructors from your enrolled courses will appear here.'}
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const hasImg = !!contact.userProfilePictureUrl && !imgErrors[contact.id];
                  const firstChar = (contact.name || '?').charAt(0).toUpperCase();
                  const unread = unreadContacts[contact.id] || 0;

                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`w-full p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition text-left ${
                        selectedContact?.id === contact.id
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {hasImg ? (
                          <img
                            src={contact.userProfilePictureUrl}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                            onError={() => handleImageError(contact.id)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{firstChar}</span>
                          </div>
                        )}
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {contact.name || 'Unknown User'}
                          </h3>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {user?.role === 'student' ? 'Instructor' : 'Student'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-gray-950/40">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    {selectedContact.userProfilePictureUrl && !imgErrors[selectedContact.id] ? (
                      <img
                        src={selectedContact.userProfilePictureUrl}
                        alt={selectedContact.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                        onError={() => handleImageError(selectedContact.id)}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {(selectedContact.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        {selectedContact.name || 'User'}
                      </h3>
                      <div className="flex items-center mt-0.5">
                        <Circle
                          className={`h-2 w-2 ${
                            isOnline ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-400 text-gray-400'
                          }`}
                        />
                        <span className="ml-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400 mb-2" />
                      <p className="text-xs">Loading message history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs">No messages yet. Send a greeting to start chatting!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn =
                        !!message.senderId &&
                        !!user?.id &&
                        String(message.senderId).toLowerCase() === String(user.id).toLowerCase();
                      return (
                        <div
                          key={message.id || message.messageId || `msg_${Math.random()}`}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl text-xs ${
                              isOwn
                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700/60 rounded-tl-none shadow-xs'
                            }`}
                          >
                            <p className="break-words leading-relaxed">{message.message}</p>
                            <div
                              className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                                isOwn ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              <span>
                                {new Date(message.sentAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOwn && (
                                <span>
                                  {message.isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-300 inline" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-indigo-300 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isSending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose a contact from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
