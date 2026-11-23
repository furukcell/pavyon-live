# PAVYON LIVE — Release Runbook (TikTok connector deferred)

This runbook covers local verification, hosting preparation and OBS Browser Source setup. It does not claim that a TikTok LIVE event source is connected.

## 1. Local verification

Requirements: Node.js 22.

```bash
npm install
npm test
npm run build
npm run test:e2e
```

Start the local app:

```bash
npm run dev
```

- Game and operator test panel: http://localhost:5173/
- Stream-only layout: http://localhost:5173/?view=stream
- Server health: http://localhost:3001/health
- Server status: http://localhost:3001/api/status

The development event endpoint is available only when `NODE_ENV` is not `production`. It is a simulator, not a TikTok connection.

Example local simulated events:

```bash
curl -X POST http://localhost:3001/dev/event \
  -H "Content-Type: application/json" \
  -d '{"type":"comment","username":"demo_viewer","comment":"!gel","eventId":"demo-comment-1"}'

curl -X POST http://localhost:3001/dev/event \
  -H "Content-Type: application/json" \
  -d '{"type":"gift","username":"demo_viewer","giftName":"Finger Heart","eventId":"demo-gift-1"}'

curl -X POST http://localhost:3001/dev/event \
  -H "Content-Type: application/json" \
  -d '{"type":"like","username":"demo_viewer","count":25,"eventId":"demo-like-1"}'
```

## 2. Render deployment

The repository contains a Render Blueprint in `render.yaml`.

1. Push the verified `main` branch.
2. In Render, create a new Blueprint deployment and select this repository.
3. Confirm the `pavyon-live` web service, Node runtime, build command `npm install && npm run build`, start command `npm start`, and health check `/health`.
4. Keep `NODE_ENV=production`.
5. Do not add API keys or secrets to the repository. The signed provider webhook stays unavailable until a secret is deliberately configured.
6. After deployment, verify `/health` returns HTTP 200 and `/api/status` reports the expected server state.

The actual public URL is assigned by Render; use the URL shown in the Render dashboard. No deployment is considered complete until the live service has been checked.

## 3. OBS / TikTok LIVE Studio Browser Source

Use the deployed HTTPS URL with `?view=stream`.

- Landscape source: 1920 × 1080.
- Portrait source: 1080 × 1920.
- Enable Browser Source audio in OBS if music is played in the browser.
- Check the source at the actual stream canvas size, not only in the browser window.
- Confirm the connection indicator, viewer/kons/like counters and recent-event strip are legible.
- Test scene switching, source refresh and browser audio before going live.

The stream view intentionally hides the operator test controls. For a local rehearsal, use the local simulator endpoint in section 1 while the stream page is connected to the same local server.

## 4. Pre-broadcast acceptance checklist (TikTok connector excluded)

- [ ] Unit and server integration tests pass.
- [ ] Production build succeeds.
- [ ] Desktop and mobile Playwright E2E tests pass.
- [ ] 25 / 50 / 75 / 100 viewer entry scenario completes without crash.
- [ ] Viewer exit clears seat, waiter and kons reservations.
- [ ] Gift actions and timer expiry return actors to a valid state.
- [ ] 30-request waiter queue limit and FIFO behavior verified.
- [ ] Render deployment and health check verified.
- [ ] OBS landscape and portrait layouts checked at final resolution.
- [ ] Browser audio and licensed music playback checked.
- [ ] Local simulated event rehearsal completed.
- [ ] No secrets or development-only endpoints exposed in production.

## Deferred item

The real TikTok LIVE event connector, platform authorization and a rehearsal using a real TikTok broadcast are explicitly deferred. The signed server bridge in this repository is only a receiver for a separately approved provider; it does not itself connect to TikTok.
