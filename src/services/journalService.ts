import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalSession, JournalMessage, JournalCategory } from '../types';

/**
 * Strips all undefined fields from an object before passing to Firestore SDK
 */
function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Generates an alphanumeric ID conforming to `isValidId` in firestore.rules
 */
export function generateDocumentId(prefix: string = 'j'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Derives a clean, safe title from the initial prompt (max 100 characters)
 */
export function deriveJournalTitle(prompt: string, category: JournalCategory = 'reflection'): string {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)} Session`;
  }
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return trimmed.substring(0, 57) + '...';
}

/**
 * Initializes a new journal session in the authenticated user's subcollection
 * Path: users/{uid}/journals/{journalId}
 */
export async function createJournalSession(
  uid: string,
  journalId: string,
  initialPrompt: string,
  initialResponse: string,
  category: JournalCategory = 'reflection',
  customTitle?: string
): Promise<void> {
  if (!uid) throw new Error('Authentication required: Missing user UID');
  if (!journalId) throw new Error('Missing journal ID');

  const title = (customTitle && customTitle.trim())
    ? customTitle.trim().substring(0, 120)
    : deriveJournalTitle(initialPrompt, category);

  const journalRef = doc(db, 'users', uid, 'journals', journalId);

  const payload = sanitizeFirestorePayload({
    userId: uid,
    title: title,
    initialPrompt: initialPrompt.substring(0, 10000),
    latestResponse: initialResponse.substring(0, 30000),
    category: category,
    createdAt: serverTimestamp(),
  });

  await setDoc(journalRef, payload);
}

/**
 * Persists a message turn into the subcollection
 * Path: users/{uid}/journals/{journalId}/messages/{messageId}
 */
export async function saveJournalMessage(
  uid: string,
  journalId: string,
  messageId: string,
  role: 'user' | 'model',
  content: string
): Promise<void> {
  if (!uid) throw new Error('Authentication required: Missing user UID');
  if (!journalId) throw new Error('Missing journal ID');
  if (!messageId) throw new Error('Missing message ID');

  const messageRef = doc(db, 'users', uid, 'journals', journalId, 'messages', messageId);

  const payload = sanitizeFirestorePayload({
    role: role,
    content: content.substring(0, 30000),
    createdAt: serverTimestamp(),
  });

  await setDoc(messageRef, payload);
}

/**
 * Updates a journal session's latest response and timestamp
 * Path: users/{uid}/journals/{journalId}
 */
export async function updateJournalSessionMetadata(
  uid: string,
  journalId: string,
  latestResponse: string
): Promise<void> {
  if (!uid) throw new Error('Authentication required: Missing user UID');
  if (!journalId) throw new Error('Missing journal ID');

  const journalRef = doc(db, 'users', uid, 'journals', journalId);

  const payload = sanitizeFirestorePayload({
    latestResponse: latestResponse.substring(0, 30000),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(journalRef, payload);
}

/**
 * Atomically or sequentially executes a complete turn save to Firestore.
 * If creating the journal for the first turn, saves the parent document first.
 */
export async function persistTurnToFirestore(params: {
  uid: string;
  journalId: string;
  userMessageId: string;
  userMessageContent: string;
  modelMessageId: string;
  modelMessageContent: string;
  isFirstTurn: boolean;
  title: string;
  category: JournalCategory;
}): Promise<void> {
  const {
    uid,
    journalId,
    userMessageId,
    userMessageContent,
    modelMessageId,
    modelMessageContent,
    isFirstTurn,
    title,
    category,
  } = params;

  if (!uid) throw new Error('Authentication required: Missing user UID');

  // Step 1: If first turn, create the parent journal document
  if (isFirstTurn) {
    await createJournalSession(
      uid,
      journalId,
      userMessageContent,
      modelMessageContent,
      category,
      title
    );
  }

  // Step 2: Save the user message document
  await saveJournalMessage(
    uid,
    journalId,
    userMessageId,
    'user',
    userMessageContent
  );

  // Step 3: Save the model message document
  await saveJournalMessage(
    uid,
    journalId,
    modelMessageId,
    'model',
    modelMessageContent
  );

  // Step 4: If not first turn, update the journal metadata
  if (!isFirstTurn) {
    await updateJournalSessionMetadata(uid, journalId, modelMessageContent);
  }
}

/**
 * Fetches all messages for a journal in chronological order
 */
export async function getJournalMessages(uid: string, journalId: string): Promise<JournalMessage[]> {
  if (!uid || !journalId) return [];

  const messagesRef = collection(db, 'users', uid, 'journals', journalId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const snapshot = await getDocs(q);
  const messages: JournalMessage[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    messages.push({
      id: docSnap.id,
      role: data.role as 'user' | 'model',
      content: data.content || '',
      timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      createdAt: data.createdAt || Timestamp.now(),
    });
  });

  return messages;
}

/**
 * Fetches user's journal sessions sorted by most recent first
 */
export async function getUserJournals(uid: string, maxLimit: number = 20): Promise<JournalSession[]> {
  if (!uid) return [];

  const journalsRef = collection(db, 'users', uid, 'journals');
  const q = query(journalsRef, orderBy('createdAt', 'desc'), limit(maxLimit));

  const snapshot = await getDocs(q);
  const sessions: JournalSession[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    sessions.push({
      id: docSnap.id,
      userId: data.userId || uid,
      title: data.title || 'Untitled Reflection',
      initialPrompt: data.initialPrompt || '',
      latestResponse: data.latestResponse || '',
      category: (data.category as JournalCategory) || 'reflection',
      summary: data.summary,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || data.createdAt || Timestamp.now(),
    });
  });

  return sessions;
}

/**
 * Loads a single journal session by ID from the user's path
 */
export async function getJournalSessionById(uid: string, journalId: string): Promise<JournalSession | null> {
  if (!uid || !journalId) return null;

  const journalRef = doc(db, 'users', uid, 'journals', journalId);
  const snap = await getDoc(journalRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId || uid,
    title: data.title || 'Untitled Reflection',
    initialPrompt: data.initialPrompt || '',
    latestResponse: data.latestResponse || '',
    category: (data.category as JournalCategory) || 'reflection',
    summary: data.summary,
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || data.createdAt || Timestamp.now(),
  };
}

/**
 * Deletes a journal session
 */
export async function deleteJournalSession(uid: string, journalId: string): Promise<void> {
  if (!uid || !journalId) return;
  const journalRef = doc(db, 'users', uid, 'journals', journalId);
  await deleteDoc(journalRef);
}
