export interface Contact {
  id: string;
  phoneNumber?: string;
  email?: string;
  linkedId?: string;
  linkPrecedence: "primary" | "secondary";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export interface IdentifyResponse {
  contact: {
    primaryContactId: string;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: string[];
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: any;
  source: "api" | "database" | "system";
}

export interface DatabaseState {
  contacts: Contact[];
  lastUpdated: string;
}

export interface ApiTestResult {
  success: boolean;
  data?: IdentifyResponse;
  error?: string;
  timestamp: string;
  request: IdentifyRequest;
  duration: number;
}

export interface ContactNode {
  id: string;
  type: "contact";
  position: { x: number; y: number };
  data: {
    contact: Contact;
    isPrimary: boolean;
    emails: string[];
    phoneNumbers: string[];
    secondaryCount: number;
  };
}

export interface ContactEdge {
  id: string;
  source: string;
  target: string;
  type: "smoothstep";
  animated: boolean;
  label?: string;
}
