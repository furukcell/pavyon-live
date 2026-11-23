import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createProviderSignature } from './providerWebhook.js';

async function startServer(extraEnv = {}) {
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '0', NODE_ENV: 'test', ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  let port;
  let startupError;
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    output += chunk;
    const match = output.match(/listening on port (\d+)/);
    if (match) port = Number(match[1]);
  });
  child.stderr.on('data', chunk => { startupError = (startupError || '') + chunk; });

  const deadline = Date.now() + 10_000;
  while (!port && Date.now() < deadline && child.exitCode === null) {
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  if (!port) {
    child.kill('SIGTERM');
    throw new Error(`Server did not start. stdout=${output} stderr=${startupError}`);
  }
  return {
    child,
    baseUrl: `http://127.0.0.1:${port}`,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => { clearTimeout(timer); resolve(); });
      });
    }
  };
}

test('production server smoke: health, status, normalized events and idempotency', async () => {
  const secret = 'integration-test-secret-with-sufficient-entropy';
  const server = await startServer({ LIVE_GIFT_MAP: JSON.stringify({ Rose: 'dance' }), LIVE_PROVIDER_WEBHOOK_SECRET: secret });
  try {
    const health = await fetch(`${server.baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).ok, true);

    const initial = await (await fetch(`${server.baseUrl}/api/status`)).json();
    assert.equal(initial.ok, true);
    assert.equal(initial.integration, 'signed-provider-bridge');
    assert.equal(initial.accepted, 0);

    const payload = { type: 'gift', username: 'test_viewer', giftName: 'Rose', eventId: 'integration-once' };
    const accepted = await fetch(`${server.baseUrl}/dev/event`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
    });
    assert.equal(accepted.status, 202);
    assert.equal((await accepted.json()).duplicate, false);

    const duplicate = await fetch(`${server.baseUrl}/dev/event`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
    });
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).duplicate, true);

    const status = await (await fetch(`${server.baseUrl}/api/status`)).json();
    assert.equal(status.accepted, 1);
    assert.equal(status.gifts, 1);
    assert.equal(status.recentEvents[0].action, 'dance');

    const invalid = await fetch(`${server.baseUrl}/dev/event`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'gift', username: 'x', giftName: 'Rose', action: 'unknown' })
    });
    assert.equal(invalid.status, 400);

    const rawBody = Buffer.from(JSON.stringify({ type: 'like', username: 'signed_viewer', count: 3, eventId: 'signed-event-once' }));
    const timestamp = String(Date.now());
    const signature = createProviderSignature(rawBody, timestamp, secret);
    const signed = await fetch(`${server.baseUrl}/integrations/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-pavyon-timestamp': timestamp, 'x-pavyon-signature': signature },
      body: rawBody
    });
    assert.equal(signed.status, 202);

    const replay = await fetch(`${server.baseUrl}/integrations/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-pavyon-timestamp': timestamp, 'x-pavyon-signature': signature },
      body: rawBody
    });
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).duplicate, true);

    const badSignature = await fetch(`${server.baseUrl}/integrations/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-pavyon-timestamp': timestamp, 'x-pavyon-signature': `sha256=${'0'.repeat(64)}` },
      body: rawBody
    });
    assert.equal(badSignature.status, 401);

    const finalStatus = await (await fetch(`${server.baseUrl}/api/status`)).json();
    assert.equal(finalStatus.accepted, 2);
    assert.equal(finalStatus.likes, 1);
  } finally {
    await server.stop();
  }
});

test('provider bridge remains disabled when no signing secret is configured', async () => {
  const server = await startServer({ LIVE_PROVIDER_WEBHOOK_SECRET: '' });
  try {
    const response = await fetch(`${server.baseUrl}/integrations/events`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}'
    });
    assert.equal(response.status, 503);
  } finally {
    await server.stop();
  }
});

test('production mode refuses the development event endpoint', async () => {
  const server = await startServer({ NODE_ENV: 'production' });
  try {
    const response = await fetch(`${server.baseUrl}/dev/event`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'like', username: 'test_viewer', count: 1 })
    });
    assert.equal(response.status, 403);
  } finally {
    await server.stop();
  }
});
