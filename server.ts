import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import journalRouter from './server/routes/journal';
import { errorHandler } from './server/middleware/errorHandler';

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();

  // 1. Correlation Request ID Middleware
  app.use((req, res, next) => {
    const requestId = 'req_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // 2. Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // 3. Top-Level Body Parsers (Strict Limits)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Privacy-Safe Access Logging (No full prompts, tokens, or secrets logged)
  app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const reqId = (req as any).requestId || '-';
      const status = res.statusCode;
      // Exclude noisy asset requests
      if (!req.url.startsWith('/@') && !req.url.startsWith('/src/')) {
        console.log(`[HTTP] [${reqId}] ${req.method} ${req.originalUrl || req.url} ${status} (${duration}ms)`);
      }
    });
    next();
  });

  // 5. API Health Check Route
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'reflectai-server',
      timestamp: new Date().toISOString(),
      model: 'gemini-3.6-flash'
    });
  });

  // 6. Mount Journal API Routes
  app.use('/api/journal', journalRouter);

  // 7. Centralized Error Handling Middleware for API Routes
  app.use(errorHandler);

  // 8. Vite Development Middleware or Static File Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Server] ReflectAI server running securely on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
