import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT) || 3001;
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new Server(httpServer, { cors: { origin: allowedOrigin } });

app.get('/health', (_req, res) => res.json({ ok: true, service: 'pavyon-live-server' }));
app.get('/api/status', (_req, res) => res.json({ ok: true, integration: 'simulator-only' }));

// This endpoint is intentionally a local development bridge, not a public TikTok webhook.
// A future TikTok adapter must validate its source and normalize events before emitting.
app.use(express.json({ limit: '32kb' }));
app.post('/dev/event', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production' });
  const event = req.body;
  if (!event || !['comment', 'like', 'gift'].includes(event.type)) {
    return res.status(400).json({ error: 'Unsupported event type' });
  }
  io.emit('live:event', event);
  res.status(202).json({ accepted: true });
});

httpServer.listen(port, () => {
  console.log(`PAVYON LIVE server listening on http://localhost:${port}`);
});
