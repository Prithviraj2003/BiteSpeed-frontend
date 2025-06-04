import { io, Socket } from "socket.io-client";
import { LogEntry } from "../types";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isInitialized = false;

  constructor() {
    // Don't connect immediately, wait for initialization
  }

  initialize(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.connect();
    }
  }

  connect(): void {
    const socketUrl =
      process.env["REACT_APP_SOCKET_URL"] || "http://localhost:3001";

    console.log("🔄 Attempting to connect to WebSocket:", socketUrl);

    try {
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("🔗 WebSocket connected successfully");
      this.reconnectAttempts = 0;
      this.emitToWindow("websocket-connected", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
      this.emitToWindow("websocket-disconnected", { connected: false, reason });

      if (reason === "io server disconnect" || reason === "transport close") {
        // Server initiated disconnect or transport error, try to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      this.emitToWindow("websocket-error", { error: error.message });
      this.scheduleReconnect();
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 WebSocket reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ WebSocket reconnection error:", error);
    });

    // Listen for log entries
    this.socket.on("log-entry", (logEntry: LogEntry) => {
      this.emitToWindow("new-log-entry", logEntry);
    });

    // Listen for database updates
    this.socket.on("database-update", (data: any) => {
      this.emitToWindow("database-update", data);
    });

    // Listen for contact changes
    this.socket.on("contact-change", (data: any) => {
      this.emitToWindow("contact-change", data);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private emitToWindow(eventName: string, data: any): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Send a message to the server (if needed)
  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("WebSocket not connected, cannot emit event:", event);
    }
  }
}

// Create singleton instance but don't auto-connect
const websocketService = new WebSocketService();

export default websocketService;
