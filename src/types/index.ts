import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

export type JournalCategory = 'reflection' | 'brainstorming' | 'summary' | 'general';

export interface StructuredSummary {
  overview: string;
  keyThemes: string[];
  actionItems: string[];
  sentiment?: string;
}

export interface JournalSession {
  id: string;
  userId: string;
  title: string;
  initialPrompt: string;
  latestResponse: string;
  category: JournalCategory;
  summary?: StructuredSummary;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  createdAt: Timestamp;
}

export type PersistenceState = 'idle' | 'sending' | 'ai-responding' | 'saving' | 'saved' | 'error';

export interface PendingSaveTurn {
  journalId: string;
  userMessageId: string;
  userMessageContent: string;
  modelMessageId: string;
  modelMessageContent: string;
  isFirstTurn: boolean;
  title: string;
  category: JournalCategory;
}
