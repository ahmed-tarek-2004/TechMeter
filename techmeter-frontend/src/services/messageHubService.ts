import * as signalR from '@microsoft/signalr';
import { MessageEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://localhost:7165';

class MessageHubService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: MessageEvent) => void)[] = [];
  private onlineStatusCallbacks: ((isOnline: boolean) => void)[] = [];
  private readStatusCallbacks: ((isRead: boolean) => void)[] = [];
  private connectPromise: Promise<void> | null = null;

  private buildConnection(): signalR.HubConnection {
    return new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/messageHub`, {
        accessTokenFactory: () => localStorage.getItem('accessToken') || '',
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) return 2000;
          if (retryContext.previousRetryCount < 6) return 5000;
          return 10000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    if (!this.connection) {
      this.connection = this.buildConnection();

      const handleIncomingMessage = (message: any) => {
        const normalizedMessage: MessageEvent = {
          id: Number(message?.id ?? message?.Id ?? message?.messageId ?? message?.MessageId ?? Date.now()),
          content: String(message?.content ?? message?.Content ?? message?.message ?? message?.Message ?? ''),
          sentAt: String(message?.sentAt ?? message?.SentAt ?? new Date().toISOString()),
          isRead: Boolean(message?.isRead ?? message?.IsRead ?? false),
          sender: {
            senderId: String(
              message?.sender?.senderId ??
                message?.Sender?.SenderId ??
                message?.senderId ??
                message?.SenderId ??
                ''
            ),
            senderName: String(
              message?.sender?.senderName ??
                message?.Sender?.SenderName ??
                message?.senderName ??
                message?.SenderName ??
                'User'
            ),
            senderEmail: String(
              message?.sender?.senderEmail ??
                message?.Sender?.SenderEmail ??
                message?.senderEmail ??
                message?.SenderEmail ??
                ''
            ),
            recipientImageUrl: String(
              message?.sender?.recipientImageUrl ??
                message?.Sender?.RecipientImageUrl ??
                message?.recipientImageUrl ??
                message?.RecipientImageUrl ??
                ''
            ),
          },
        };

        this.messageCallbacks.forEach((cb) => {
          try {
            cb(normalizedMessage);
          } catch (err) {
            console.error('Error in message callback:', err);
          }
        });
      };

      this.connection.on('ReceiveMessage', handleIncomingMessage);
      this.connection.on('receivemessage', handleIncomingMessage);

      this.connection.on('CheckReceiverAvailability', (isOnline: boolean) => {
        this.onlineStatusCallbacks.forEach((cb) => {
          try {
            cb(Boolean(isOnline));
          } catch (err) {
            console.error('Error in online callback:', err);
          }
        });
      });

      this.connection.on('IsRead', (isRead: boolean) => {
        this.readStatusCallbacks.forEach((cb) => {
          try {
            cb(Boolean(isRead));
          } catch (err) {
            console.error('Error in read callback:', err);
          }
        });
      });

      this.connection.on('isread', (isRead: boolean) => {
        this.readStatusCallbacks.forEach((cb) => {
          try {
            cb(Boolean(isRead));
          } catch (err) {
            console.error('Error in read callback:', err);
          }
        });
      });
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.connectPromise = (async () => {
        try {
          await this.connection?.start();
        } catch (error) {
          console.warn('Error starting message hub connection:', error);
        } finally {
          this.connectPromise = null;
        }
      })();

      return this.connectPromise;
    }
  }

  async ensureConnected(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!this.connection) {
      await this.connect();
      return;
    }

    if (this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (
      this.connection.state === signalR.HubConnectionState.Connecting ||
      this.connection.state === signalR.HubConnectionState.Reconnecting
    ) {
      return new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            clearInterval(interval);
            resolve();
          } else if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
            clearInterval(interval);
            this.connect().then(resolve).catch(reject);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            resolve();
          } else {
            reject(new Error('Connection timeout waiting for Message Hub'));
          }
        }, 5000);
      });
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Suppress disconnection errors
      }
    }
  }

  async sendMessage(message: string, recipientId: string): Promise<void> {
    await this.ensureConnected();

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
    try {
      await this.ensureConnected();
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('isonline', recipientId);
      }
    } catch (error) {
      console.error('Error checking online status:', error);
    }
  }

  async markAsRead(messageId: string | number, senderId: string): Promise<void> {
    try {
      await this.ensureConnected();
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('markasread', String(messageId), String(senderId));
      }
    } catch (error) {
      console.error('Error marking message as read in hub:', error);
    }
  }

  async setActiveChat(userId: string): Promise<void> {
    if (!userId) return;
    try {
      await this.ensureConnected();
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('SetActiveChat', userId);
      }
    } catch (error) {
      console.error('Error setting active chat:', error);
    }
  }

  async closeChat(userId: string): Promise<void> {
    if (!userId) return;
    try {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('CloseChat', userId);
      }
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  }

  onMessageReceived(callback: (message: MessageEvent) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onOnlineStatusChanged(callback: (isOnline: boolean) => void): () => void {
    this.onlineStatusCallbacks.push(callback);
    return () => {
      this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter((cb) => cb !== callback);
    };
  }

  onReadStatusChanged(callback: (isRead: boolean) => void): () => void {
    this.readStatusCallbacks.push(callback);
    return () => {
      this.readStatusCallbacks = this.readStatusCallbacks.filter((cb) => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const messageHubService = new MessageHubService();
