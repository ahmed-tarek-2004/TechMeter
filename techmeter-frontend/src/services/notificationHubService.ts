import * as signalR from '@microsoft/signalr';
import { Notification } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'https://localhost:7165';

export interface SignalRNotificationPayload {
  id?: string;
  Id?: string;
  userId?: string;
  UserId?: string;
  title?: string;
  Title?: string;
  titile?: string;
  Titile?: string;
  message?: string;
  Message?: string;
  createdAt?: string;
  CreatedAt?: string;
  isRead?: boolean;
  IsRead?: boolean;
}

class NotificationHubService {
  private connection: signalR.HubConnection | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private connectionStateCallbacks: ((isConnected: boolean) => void)[] = [];
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
      return;
    }

    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/notificationHub`, {
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

      const handleIncomingNotification = (raw: SignalRNotificationPayload | any) => {
        const normalizedNotification: Notification = {
          id: raw?.id || raw?.Id || raw?.notificationId || raw?.NotificationId || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: raw?.title || raw?.Title || raw?.titile || raw?.Titile || 'New Notification',
          message: raw?.message || raw?.Message || '',
          createdAt: raw?.createdAt || raw?.CreatedAt || new Date().toISOString(),
          isRead: raw?.isRead ?? raw?.IsRead ?? false,
          receiptId: raw?.userId || raw?.UserId || raw?.receiptId || raw?.ReceiptId || '',
        };

        this.notificationCallbacks.forEach((cb) => {
          try {
            cb(normalizedNotification);
          } catch (err) {
            console.error('Error in notification callback:', err);
          }
        });
      };

      // Listen on exact backend casing "ReciveNotification" and standard "ReceiveNotification"
      this.connection.on('ReciveNotification', handleIncomingNotification);
      this.connection.on('ReceiveNotification', handleIncomingNotification);

      this.connection.onreconnecting(() => {
        this.notifyConnectionState(false);
      });

      this.connection.onreconnected(() => {
        this.notifyConnectionState(true);
      });

      this.connection.onclose(() => {
        this.notifyConnectionState(false);
      });
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.connectPromise = (async () => {
        try {
          await this.connection?.start();
          this.notifyConnectionState(true);
        } catch (error) {
          this.notifyConnectionState(false);
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
        this.notifyConnectionState(false);
      } catch {
        // Suppress disconnection errors
      }
    }
  }

  onNotificationReceived(callback: (notification: Notification) => void): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConnectionStateChanged(callback: (isConnected: boolean) => void): () => void {
    this.connectionStateCallbacks.push(callback);
    return () => {
      this.connectionStateCallbacks = this.connectionStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyConnectionState(isConnected: boolean) {
    this.connectionStateCallbacks.forEach((cb) => {
      try {
        cb(isConnected);
      } catch (err) {
        console.error('Error in connection state callback:', err);
      }
    });
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const notificationHubService = new NotificationHubService();
