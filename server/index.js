import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
app.post('/dev/event', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production.' });
  const event = req.body;
  if (!event || !['comment', 'like', 'gift'].includes(event.type)) return res.status(400).json({ error: 'Unsupported event type.' });
  if (event.type === 'comment' && (typeof event.username !== 'string' || typeof event.comment !== 'string')) return res.status(400).json({ error: 'Comment requires username and comment.' });
  if (event.type === 'like' && !Number.isFinite(Number(event.count))) return res.status(400).json({ error: 'Like requires numeric count.' });
  if (event.type === 'gift' && typeof event.username !== 'string') return res.status(400).json({ error: 'Gift requires username.' });
  io.emit('live:event', event);
  return res.status(202).json({ accepted: true });
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
