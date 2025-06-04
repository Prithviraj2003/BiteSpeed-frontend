import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { IdentifyRequest, IdentifyResponse, Contact } from "../types";

const API_BASE_URL =
  process.env["REACT_APP_API_URL"] || "http://localhost:3001/";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `✅ API Response: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    console.error(
      "❌ API Response Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export class ApiService {
  static async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    try {
      const startTime = Date.now();
      const response: AxiosResponse<IdentifyResponse> = await api.post(
        "/api/identify",
        request
      );
      const duration = Date.now() - startTime;

      // Emit custom event for duration tracking
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api-call", {
            detail: { endpoint: "/api/identify", duration, success: true },
          })
        );
      }

      return response.data;
    } catch (error: any) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api-call", {
            detail: {
              endpoint: "/api/identify",
              duration: 0,
              success: false,
              error: error.message,
            },
          })
        );
      }
      throw error;
    }
  }

  static async getHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get("/api/health");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all contacts from the backend
  static async getAllContacts(): Promise<Contact[]> {
    try {
      const response = await api.get("/api/contacts");

      // Backend returns {success: true, data: Contact[], count: number}
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      console.warn("Unexpected contacts response structure:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      return [];
    }
  }
}

export default ApiService;
