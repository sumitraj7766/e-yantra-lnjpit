import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/api.js';
import { initializeDatabase, db } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Ensure uploads directory exists on disk for real profile photos and assets
  const uploadsDir = path.join(process.cwd(), 'uploads', 'team');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Initialize MongoDB Atlas connection & auto-seeding
  try {
    await initializeDatabase();
  } catch (err: any) {
    console.warn('[MongoDB Atlas] Initialization note:', err.message);
  }

  // JSON Body Parser with 15mb limit for rich uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Serve persistent uploaded files with automatic MongoDB Atlas fallback
  app.get('/uploads/team/:filename', async (req, res, next) => {
    const filename = path.basename(req.params.filename);
    const diskPath = path.join(process.cwd(), 'uploads', 'team', filename);
    if (fs.existsSync(diskPath)) {
      return res.sendFile(diskPath);
    }
    try {
      const photo = await db.getStoredPhoto(filename);
      if (photo && photo.data) {
        let imageBuffer: Buffer;
        if (Buffer.isBuffer(photo.data)) {
          imageBuffer = photo.data;
        } else if ((photo.data as any)?.buffer && Buffer.isBuffer((photo.data as any).buffer)) {
          imageBuffer = (photo.data as any).buffer;
        } else {
          imageBuffer = Buffer.from(photo.data as any);
        }

        if (imageBuffer && imageBuffer.length > 0) {
          try {
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            await fs.promises.writeFile(diskPath, imageBuffer);
          } catch (e) {
            // ignore cache write error
          }
          res.setHeader('Content-Type', photo.mimeType || 'image/jpeg');
          res.setHeader('Content-Length', String(imageBuffer.length));
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.end(imageBuffer);
        }
      }
    } catch (e) {
      console.warn('[Uploads Fallback] Error:', e);
    }
    next();
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'e-Yantra LNJPIT Platform (MongoDB Atlas)', timestamp: new Date().toISOString() });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Strict API 404 handler - guarantees API requests NEVER fall through to HTML SPA
  app.all('/api*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
  });

  // Global Express error handler - always returns JSON for errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  // Development vs Production static routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[e-Yantra LNJPIT Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
