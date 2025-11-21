export type Theme = 'dark' | 'light';
export type ViewState = 'login' | 'register' | 'dashboard' | 'library' | 'community' | 'support' | 'doc-read';

export interface UserPreferences {
  aiSuggestions: boolean;
  topics: string[];
}

export interface User {
  uid: string;
  email: string;
  name: string;
  company?: string;
  role: string;
  theme: Theme; 
  storageUsed: number; 
  storageLimit: number; 
  preferences: UserPreferences;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'other-user' | 'support';
  senderName?: string;
  text: string;
  referenceId?: number; 
  timestamp?: string;
}

export interface DocumentData {
  id: string;
  title: string;
  ownerId: string; // Made optional to support backend data which might not return it
  ownerName: string; // Made optional
  isPublic: boolean; // Made optional
  summary: string;
  content?: string[]; // Made optional as backend sends 'text' instead
  text?: string;      // <--- ADDED: This fixes the error
  uploadDate?: string; // Made optional
  fileSize?: string;   // Made optional
  type?: string;       // Made optional
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  active: boolean;
  relatedDocId: string;
  relatedDocTitle: string;
  type: 'public' | 'private'; 
  orgName?: string; 
  tags?: string[]; 
}

export interface HistoryItem {
  id: string;
  query: string;
  docTitle: string;
  date: string;
  docId: string;
}

export interface ChatMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
}