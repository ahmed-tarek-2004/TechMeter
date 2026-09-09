import * as signalR from '@microsoft/signalr';
import { MessageEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://localhost:7165';

class MessageHubService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: MessageEvent) => void)[] = [];
  private onlineStatusCallbacks: ((isOnline: boolean) => void)[] = [];
  private readStatusCallbacks: ((isRead: boolean) => void)[] = [];
  private connectPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No authentication token found, user must login first');
      return;
    }

    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/messageHub`, {
          accessTokenFactory: () => localStorage.getItem('accessToken') || '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveMessage', (message: any) => {
        const normalizedMessage: MessageEvent = {
          id: message?.id ?? message?.Id ?? Date.now(),
          content: message?.content ?? message?.Content ?? '',
          sentAt: message?.sentAt ?? message?.SentAt ?? new Date().toISOString(),
          sender: {
            senderId: message?.sender?.senderId ?? message?.Sender?.SenderId ?? message?.senderId ?? '',
            senderName: message?.sender?.senderName ?? message?.Sender?.SenderName ?? '',
            senderEmail: message?.sender?.senderEmail ?? message?.Sender?.SenderEmail ?? '',
            recipientImageUrl: message?.sender?.recipientImageUrl ?? message?.Sender?.RecipientImageUrl ?? '',
          },
        };
        this.messageCallbacks.forEach(callback => callback(normalizedMessage));
      });

      this.connection.on('CheckReceiverAvailability', (isOnline: boolean) => {
        this.onlineStatusCallbacks.forEach(callback => callback(isOnline));
      });

      this.connection.on('IsRead', (isRead: boolean) => {
        this.readStatusCallbacks.forEach(callback => callback(isRead));
      });

      this.connection.onreconnecting(() => {
        console.log('Reconnecting to message hub...');
      });

      this.connection.onreconnected(() => {
        console.log('Reconnected to message hub');
      });

      this.connection.onclose(() => {
        console.log('Message hub connection closed');
      });
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.connectPromise = (async () => {
        try {
          await this.connection?.start();
          console.log('Connected to message hub');
        } catch (error) {
          console.error('Error connecting to message hub:', error);
          throw error;
        } finally {
          this.connectPromise = null;
        }
      })();

      return this.connectPromise;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error disconnecting from message hub:', error);
      }
    }
  }

  async sendMessage(message: string, recipientId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to message hub');
    }

    try {
      await this.connection.invoke('sendmessage', message, recipientId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async checkOnlineStatus(recipientId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('isonline', recipientId);
    } catch (error) {
      console.error('Error checking online status:', error);
    }
  }

  async markAsRead(messageId: string, senderId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('markasread', messageId, senderId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  onMessageReceived(callback: (message: MessageEvent) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onOnlineStatusChanged(callback: (isOnline: boolean) => void): () => void {
    this.onlineStatusCallbacks.push(callback);
    return () => {
      this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  onReadStatusChanged(callback: (isRead: boolean) => void): () => void {
    this.readStatusCallbacks.push(callback);
    return () => {
      this.readStatusCallbacks = this.readStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const messageHubService = new MessageHubService();

