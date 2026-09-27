/**
 * Global singleton to track whether the user is currently viewing the messages/chat screen
 * and which contact conversation is actively open.
 */
class ActiveChatTracker {
  private activeContactId: string | null = null;
  private isChatPageOpen: boolean = false;
  private listeners: (() => void)[] = [];

  setActiveContact(contactId: string | null) {
    this.activeContactId = contactId;
    this.notify();
  }

  getActiveContact(): string | null {
    return this.activeContactId;
  }

  setChatPageOpen(isOpen: boolean) {
    this.isChatPageOpen = isOpen;
    if (!isOpen) {
      this.activeContactId = null;
    }
    this.notify();
  }

  getIsChatPageOpen(): boolean {
    return this.isChatPageOpen;
  }

  isChatActiveWith(senderId?: string | null): boolean {
    if (!this.isChatPageOpen || !this.activeContactId) {
      return false;
    }
    if (!senderId) {
      return false;
    }
    return String(this.activeContactId).toLowerCase() === String(senderId).toLowerCase();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Suppress listener errors
      }
    });
  }
}

export const activeChatTracker = new ActiveChatTracker();
