export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SendGeminiChatParams {
  prompt: string;
  messages?: ChatMessage[];
  getIdToken: () => Promise<string | null>;
}

export interface GeminiChatResponse {
  responseText: string;
  modelUsed: 'gemini-3.6-flash';
}

export class GeminiApiError extends Error {
  statusCode: number;
  details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'GeminiApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Sends an authenticated journal prompt to the Express backend proxying Gemini 3.6 Flash.
 */
export async function sendJournalChatMessage({
  prompt,
  messages = [],
  getIdToken,
}: SendGeminiChatParams): Promise<GeminiChatResponse> {
  const token = await getIdToken();

  if (!token) {
    throw new GeminiApiError('Authentication required. Please sign in to reflect with Gemini.', 401);
  }

  // Sanitize message history to remove non-essential fields
  const cleanMessages = messages.map(m => ({
    role: m.role,
    content: m.content.trim()
  }));

  try {
    const response = await fetch('/api/journal/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        messages: cleanMessages,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || `Server responded with status ${response.status}`;
      throw new GeminiApiError(errorMessage, response.status, data.details);
    }

    return {
      responseText: data.responseText,
      modelUsed: data.modelUsed || 'gemini-3.6-flash',
    };
  } catch (error: any) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    // Network or parse error
    throw new GeminiApiError(
      error.message || 'Failed to connect to the journal reflection server. Please check your connection.',
      0
    );
  }
}
