import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDevEvent } from './eventValidation.js';

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT) || 3001;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, '../dist');
const io = new Server(httpServer, { transports: ['websocket', 'polling'] });

app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'pavyon-live-server' }));
app.get('/api/status', (_req, res) => res.json({
  ok: true, integration: 'simulator-only', connectedClients: io.engine.clientsCount
}));

// Development-only event bridge. It is not a public TikTok webhook.
const seenEventIds = new Map();
const EVENT_ID_TTL_MS = 60_000;
const MAX_SEEN_EVENT_IDS = 5_000;

app.post('/dev/event', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production.' });
  const result = normalizeDevEvent(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const event = result.event;
  if (event.eventId) {
    const now = Date.now();
    for (const [id, expiresAt] of seenEventIds) {
      if (expiresAt <= now) seenEventIds.delete(id);
    }
    if (seenEventIds.has(event.eventId)) return res.status(200).json({ accepted: true, duplicate: true });
    if (seenEventIds.size >= MAX_SEEN_EVENT_IDS) {
      const oldestId = seenEventIds.keys().next().value;
      if (oldestId) seenEventIds.delete(oldestId);
    }
    seenEventIds.set(event.eventId, now + EVENT_ID_TTL_MS);
  }
  io.emit('live:event', event);
  return res.status(202).json({ accepted: true, duplicate: false });
});

app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && req.path !== '/health' && !req.path.startsWith('/dev/')) {
    return res.sendFile(path.join(distDir, 'index.html'), error => { if (error) next(error); });
  }
  return next();
});

io.on('connection', socket => {
  console.log(`Game client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Game client disconnected: ${socket.id}`));
});
httpServer.listen(port, '0.0.0.0', () => console.log(`PAVYON LIVE server listening on port ${port}`));
