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
  Sparkles,
  X,
  GraduationCap,
  Briefcase,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Contact, MessageEvent, Message } from '../../types';

const quickReplies = [
  '👋 Hello! Hope you are having a great day.',
  '📚 I have a question regarding the course content.',
  '✨ Thank you so much for your help!',
  '🚀 Looking forward to the next lecture!',
];

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Register active chat page with global tracker
  useEffect(() => {
    activeChatTracker.setChatPageOpen(true);
    return () => {
      activeChatTracker.setChatPageOpen(false);
    };
  }, []);

  // Update active contact in tracker and SignalR Hub
  useEffect(() => {
    activeChatTracker.setActiveContact(selectedContact?.id || null);
    if (selectedContact?.id) {
      // Clear unread count for the active contact
      setUnreadContacts((prev) => ({ ...prev, [selectedContact.id]: 0 }));
      messageHubService.setActiveChat(selectedContact.id);
    }

    return () => {
      if (selectedContact?.id) {
        messageHubService.closeChat(selectedContact.id);
      }
    };
  }, [selectedContact?.id]);

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
      const isFromMe =
        !!incomingSenderId &&
        !!user?.id &&
        String(incomingSenderId).toLowerCase() === String(user.id).toLowerCase();

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
          prev.map((m) =>
            !!m.senderId &&
            !!user?.id &&
            String(m.senderId).toLowerCase() === String(user.id).toLowerCase()
              ? { ...m, isRead: true }
              : m
          )
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
      setMessageText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setMessageText(text);
    inputRef.current?.focus();
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleImageError = (contactId: string) => {
    setImgErrors((prev) => ({ ...prev, [contactId]: true }));
  };

  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return '';
    }
  };

  // Group messages intelligently (smart consecutive sender grouping, date dividers)
  const processedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const isOwn =
        !!message.senderId &&
        !!user?.id &&
        String(message.senderId).toLowerCase() === String(user.id).toLowerCase();

      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];

      const prevSentAt = prevMessage ? new Date(prevMessage.sentAt).getTime() : 0;
      const currSentAt = new Date(message.sentAt).getTime();
      const nextSentAt = nextMessage ? new Date(nextMessage.sentAt).getTime() : 0;

      const dateLabel = formatMessageDate(message.sentAt);
      const prevDateLabel = prevMessage ? formatMessageDate(prevMessage.sentAt) : '';
      const showDateDivider = index === 0 || dateLabel !== prevDateLabel;

      // Group together if same sender, same date, and sent within 3 minutes of each other
      const prevIsSameSender =
        !showDateDivider &&
        prevMessage &&
        String(prevMessage.senderId).toLowerCase() === String(message.senderId).toLowerCase() &&
        currSentAt - prevSentAt < 1000 * 60 * 3;

      const nextDateLabel = nextMessage ? formatMessageDate(nextMessage.sentAt) : '';
      const nextIsSameSender =
        nextMessage &&
        dateLabel === nextDateLabel &&
        String(nextMessage.senderId).toLowerCase() === String(message.senderId).toLowerCase() &&
        nextSentAt - currSentAt < 1000 * 60 * 3;

      return {
        ...message,
        isOwn,
        isFirstInGroup: !prevIsSameSender,
        isLastInGroup: !nextIsSameSender,
        showDateDivider,
        dateLabel,
      };
    });
  }, [messages, user?.id]);

  if (!isAuthenticated || contactsLoading) {
    return (
      <div className="min-h-screen bg-slate-900/5 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Loading conversation channels...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 transition-colors duration-300 flex flex-col"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      {/* Radiant Background Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl w-full h-full mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 flex flex-col overflow-hidden">
        {/* Main Glassmorphic Container */}
        <div className="bg-white/95 dark:bg-gray-900/85 backdrop-blur-2xl shadow-2xl shadow-indigo-950/10 dark:shadow-black/50 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 overflow-hidden h-full flex flex-col md:flex-row transition-all duration-300">

          {/* Contacts Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col h-full bg-slate-50/60 dark:bg-gray-900/60 backdrop-blur-md">
            {/* Sidebar Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/70">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Direct Messages</h2>
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/40 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 shadow-2xs">
                  <Sparkles className="h-3 w-3" />
                  <span>Real-time</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white rounded-xl text-xs placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/40 p-2 space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 my-auto">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No contacts found</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
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
                  const isSelected = selectedContact?.id === contact.id;

                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`w-full p-3 rounded-2xl flex items-center transition-all duration-200 text-left relative group ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-100/90 via-purple-50/60 to-transparent dark:from-indigo-950/60 dark:via-purple-950/25 dark:to-transparent border-l-4 border-indigo-600 dark:border-indigo-500 shadow-2xs'
                          : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {hasImg ? (
                          <img
                            src={contact.userProfilePictureUrl}
                            alt={contact.name}
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-2xs"
                            onError={() => handleImageError(contact.id)}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xs border-2 border-white dark:border-gray-800">
                            <span className="text-white text-sm font-black">{firstChar}</span>
                          </div>
                        )}
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-xs font-bold truncate transition-colors ${
                              isSelected
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                          >
                            {contact.name || 'Unknown User'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {user?.role === 'student' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                              <Briefcase className="h-2.5 w-2.5" />
                              Instructor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                              <GraduationCap className="h-2.5 w-2.5" />
                              Student
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-slate-100/50 dark:bg-gray-950/50 relative overflow-hidden">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between z-20">
                  <div className="flex items-center">
                    <div className="relative flex-shrink-0">
                      {selectedContact.userProfilePictureUrl && !imgErrors[selectedContact.id] ? (
                        <img
                          src={selectedContact.userProfilePictureUrl}
                          alt={selectedContact.name}
                          className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-2xs"
                          onError={() => handleImageError(selectedContact.id)}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xs border-2 border-white dark:border-gray-800">
                          <span className="text-white text-xs font-black">
                            {(selectedContact.name || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      >
                        {isOnline && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                      </span>
                    </div>

                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white">
                          {selectedContact.name || 'User'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/40">
                          {user?.role === 'student' ? 'Instructor' : 'Student'}
                        </span>
                      </div>
                      <div className="flex items-center mt-0.5">
                        <span
                          className={`text-[11px] font-medium flex items-center gap-1 ${
                            isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Circle className={`h-2 w-2 ${isOnline ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-400 text-gray-400'}`} />
                          {isOnline ? 'Active now' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 px-3 py-1.5 rounded-xl shadow-2xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>End-to-end encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Messages Feed Canvas */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 relative bg-slate-100/60 dark:bg-gray-950/60 transition-colors"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 75%)`,
                  }}
                >
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                      <div className="p-4 rounded-2xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-gray-200/80 dark:border-gray-700/60 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Loading conversation history...</p>
                      </div>
                    </div>
                  ) : processedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-md mx-auto">
                      <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-sky-500/20 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner ring-1 ring-indigo-500/20">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1.5">
                        Start a conversation with {selectedContact.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Send a message or select a prompt below to break the ice!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        {quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            className="p-2.5 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-white hover:bg-indigo-50/90 dark:bg-gray-800/80 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700/60 rounded-xl transition shadow-2xs"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    processedMessages.map((msg, index) => {
                      // Dynamic bubble rounded corners based on position in consecutive group
                      let bubbleRadius = 'rounded-2xl';
                      if (msg.isOwn) {
                        if (msg.isFirstInGroup && msg.isLastInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-tr-xs';
                        } else if (msg.isFirstInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-tr-xs rounded-br-md';
                        } else if (msg.isLastInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-br-xs rounded-tr-md';
                        } else {
                          bubbleRadius = 'rounded-2xl rounded-r-md';
                        }
                      } else {
                        if (msg.isFirstInGroup && msg.isLastInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-tl-xs';
                        } else if (msg.isFirstInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-tl-xs rounded-bl-md';
                        } else if (msg.isLastInGroup) {
                          bubbleRadius = 'rounded-2xl rounded-bl-xs rounded-tl-md';
                        } else {
                          bubbleRadius = 'rounded-2xl rounded-l-md';
                        }
                      }

                      const marginTop = msg.showDateDivider
                        ? 'mt-2'
                        : msg.isFirstInGroup
                        ? 'mt-3.5 sm:mt-4'
                        : 'mt-1';

                      return (
                        <React.Fragment key={msg.id || msg.messageId || `msg_${index}`}>
                          {msg.showDateDivider && (
                            <div className="flex justify-center my-4 sticky top-1 z-10">
                              <span className="backdrop-blur-md bg-white/95 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3.5 py-1 rounded-full border border-gray-200 dark:border-gray-700/70 shadow-2xs flex items-center gap-1.5 transition-colors">
                                <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                <span>{msg.dateLabel}</span>
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex items-end gap-2 ${
                              msg.isOwn ? 'justify-end' : 'justify-start'
                            } ${marginTop} group`}
                          >
                            {/* Contact Avatar - only rendered on the last message in a group to avoid clutter */}
                            {!msg.isOwn && (
                              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                {msg.isLastInGroup ? (
                                  selectedContact.userProfilePictureUrl && !imgErrors[selectedContact.id] ? (
                                    <img
                                      src={selectedContact.userProfilePictureUrl}
                                      alt={selectedContact.name}
                                      className="w-7 h-7 rounded-full object-cover border border-white dark:border-gray-800 shadow-2xs"
                                      onError={() => handleImageError(selectedContact.id)}
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-2xs">
                                      {(selectedContact.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                  )
                                ) : (
                                  <div className="w-7 h-7" />
                                )}
                              </div>
                            )}

                            {/* Bubble */}
                            <div
                              className={`relative max-w-[85%] sm:max-w-md lg:max-w-lg px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs transition-all duration-150 ${bubbleRadius} ${
                                msg.isOwn
                                  ? 'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 border border-white/20'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/90 dark:border-gray-700/70 shadow-xs'
                              }`}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                                <span className="break-words leading-relaxed whitespace-pre-wrap selection:bg-indigo-300 selection:text-indigo-950 font-normal">
                                  {msg.message}
                                </span>

                                {/* Inline timestamp & status */}
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] ml-auto select-none pt-0.5 ${
                                    msg.isOwn
                                      ? 'text-indigo-100 font-medium'
                                      : 'text-gray-500 dark:text-gray-400 font-medium'
                                  }`}
                                >
                                  <span>
                                    {new Date(msg.sentAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {msg.isOwn && (
                                    <span title={msg.isRead ? 'Read' : 'Delivered'}>
                                      {msg.isRead ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] inline" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5 text-indigo-200 inline" />
                                      )}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Footer Bar */}
                <div className="p-3.5 sm:p-4 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/85 backdrop-blur-xl">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`Message ${selectedContact.name || 'user'}...`}
                        className="w-full border border-gray-200 dark:border-gray-700/70 bg-slate-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-2xl pl-4 pr-10 py-3 text-xs placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                        disabled={isSending}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isSending}
                      className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center flex-shrink-0"
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
              /* No Conversation Selected State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm mx-auto">
                  <div className="relative mb-5 mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
                    <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <MessageSquare className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-1.5">
                    Your TechMeter Messenger
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Select an instructor or student from the sidebar to start real-time messaging.
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

