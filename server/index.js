import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDevEvent } from './eventValidation.js';
import { verifyProviderSignature } from './providerWebhook.js';
import { parseGiftMapping, resolveGiftAction } from './giftMapping.js';
import { createLiveMetrics } from './liveMetrics.js';
import { createEventDeduplicator } from './eventDeduplicator.js';

const app = express();
const httpServer = createServer(app);
const configuredPort = process.env.PORT;
const port = configuredPort === undefined ? 3001 : Number(configuredPort);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, '../dist');
const io = new Server(httpServer, { transports: ['websocket', 'polling'], maxHttpBufferSize: 32 * 1024, pingTimeout: 20_000, pingInterval: 25_000 });
const giftMapping = parseGiftMapping(process.env.LIVE_GIFT_MAP || '{}');
const liveMetrics = createLiveMetrics();
const seenEventIds = createEventDeduplicator({ ttlMs: 60_000, maxEntries: 5_000 });

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
function publicLiveStatus() { return { ...liveMetrics.snapshot(), integration: process.env.LIVE_PROVIDER_WEBHOOK_SECRET ? 'signed-provider-bridge' : 'simulator-only', connectedClients: io.engine.clientsCount, configuredGiftMappings: giftMapping.size }; }
function recordLiveEvent(event) { liveMetrics.record(event); io.emit('live:status', publicLiveStatus()); }

// Signed provider bridge: connectors normalize their payload and sign the exact raw JSON bytes.
app.post('/integrations/events', express.raw({ type: 'application/json', limit: '32kb' }), (req, res) => {
  const secret = process.env.LIVE_PROVIDER_WEBHOOK_SECRET;
  const timestamp = req.get('x-pavyon-timestamp');
  const signature = req.get('x-pavyon-signature');
  if (!secret) return res.status(503).json({ error: 'Live provider integration is not configured.' });
  if (!verifyProviderSignature({ rawBody: req.body, timestamp, signature, secret })) return res.status(401).json({ error: 'Invalid or expired provider signature.' });
  let payload;
  try { payload = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid JSON payload.' }); }
  const result = normalizeDevEvent(payload);
  if (!result.ok) return res.status(400).json({ error: result.error });
  const event = result.event;
  if (event.type === 'gift' && !event.action) event.action = resolveGiftAction(event.giftName, giftMapping);
  if (!event.eventId) return res.status(400).json({ error: 'A unique eventId is required.' });
  if (seenEventIds.hasSeen(event.eventId)) return res.status(200).json({ accepted: true, duplicate: true });
  io.emit('live:event', event);
  recordLiveEvent(event);
  return res.status(202).json({ accepted: true, duplicate: false });
});

app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => res.set('Cache-Control', 'no-store').json({ ok: true, service: 'pavyon-live-server' }));
app.get('/api/status', (_req, res) => res.set('Cache-Control', 'no-store').json({ ok: true, ...publicLiveStatus() }));

// Development-only event bridge. It is not a public TikTok webhook.
app.post('/dev/event', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production.' });
  const result = normalizeDevEvent(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const event = result.event;
  if (event.type === 'gift' && !event.action) event.action = resolveGiftAction(event.giftName, giftMapping);
  if (event.eventId) {
    if (seenEventIds.hasSeen(event.eventId)) return res.status(200).json({ accepted: true, duplicate: true });
  }
  io.emit('live:event', event);
  recordLiveEvent(event);
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
  socket.emit('live:status', publicLiveStatus());
  socket.on('disconnect', () => console.log(`Game client disconnected: ${socket.id}`));
});
httpServer.listen(port, '0.0.0.0', () => console.log(`PAVYON LIVE server listening on port ${httpServer.address().port}`));

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`PAVYON LIVE shutting down after ${signal}`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  io.close(() => {
    clearTimeout(forceExit);
    process.exit(0);
  });
}
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
