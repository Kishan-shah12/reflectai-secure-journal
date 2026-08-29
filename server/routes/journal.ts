import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { journalChatRateLimiter } from '../middleware/rateLimit';
import { validateJournalChat, JournalChatRequestBody } from '../utils/validation';
import { generateJournalChat } from '../services/geminiService';

const router = Router();

/**
 * Health check endpoint for the journal API
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'journal-api',
    model: 'gemini-3.6-flash',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/journal/chat
 * Authenticated endpoint for multi-turn Gemini 3.6 Flash journal reflections.
 */
router.post(
  '/chat',
  requireAuth,
  journalChatRateLimiter,
  validateJournalChat,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { prompt, messages } = req.body as JournalChatRequestBody;

      const result = await generateJournalChat({
        prompt,
        messages,
      });

      res.status(200).json({
        responseText: result.responseText,
        modelUsed: result.modelUsed,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
