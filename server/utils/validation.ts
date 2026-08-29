import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Schema for individual message in the chat history
export const JournalMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string()
    .min(1, 'Message content cannot be empty.')
    .max(30000, 'Individual message content cannot exceed 30,000 characters.')
});

// Schema for the POST /api/journal/chat request body
export const JournalChatRequestSchema = z.object({
  prompt: z.string()
    .trim()
    .min(1, 'Prompt cannot be empty.')
    .max(10000, 'Prompt cannot exceed 10,000 characters.'),
  messages: z.array(JournalMessageSchema)
    .max(50, 'Conversation history cannot exceed 50 messages.')
    .optional()
    .default([])
});

export type JournalChatRequestBody = z.infer<typeof JournalChatRequestSchema>;

/**
 * Validation Middleware for Journal Chat endpoint
 */
export function validateJournalChat(req: Request, res: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({
      error: 'Invalid request.',
      details: 'Request body must be a JSON object.'
    });
    return;
  }

  const result = JournalChatRequestSchema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || [];
    const errorDetails = issues.map((issue: any) => {
      const path = issue.path?.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    }).join('; ') || 'Invalid request payload structure.';

    res.status(400).json({
      error: 'Invalid request.',
      details: errorDetails
    });
    return;
  }

  // Assign validated and sanitized data
  req.body = result.data;
  next();
}
