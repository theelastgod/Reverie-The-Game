import assert from 'node:assert/strict';
import { WebSocket } from 'ws';

const origin = process.argv[2] ?? 'http://127.0.0.1:8788';
const response = await fetch(`${origin}/session`, { method: 'POST', headers: { Origin: origin }, signal: AbortSignal.timeout(15000) });
assert.equal(response.status, 204);
const cookie = response.headers.get('set-cookie').split(';')[0];
const ws = new WebSocket(origin.replace(/^http/, 'ws') + '/ws', { headers: { Cookie: cookie, Origin: origin } });
try {
  const timing = await new Promise((resolve, reject) => {
    let start, frames = 0;
    const timer = setTimeout(() => reject(new Error('No complete live clock sample within 15 seconds')), 15000);
    ws.on('error', error => { clearTimeout(timer); reject(error); });
    ws.on('close', () => { clearTimeout(timer); reject(new Error('Connection closed during clock sample')); });
    ws.on('message', raw => {
      const data = JSON.parse(raw.toString());
      if (data.t !== 'snap') return;
      const wall = performance.now();
      start ??= { wall, sim: data.now };
      frames++;
      if (wall - start.wall < 6000) return;
      clearTimeout(timer);
      resolve({ wallSeconds: (wall - start.wall) / 1000, simulationSeconds: data.now - start.sim, snapshots: frames });
    });
  });
  const ratio = timing.simulationSeconds / timing.wallSeconds;
  assert.ok(ratio >= .85 && ratio <= 1.15, `simulation drift: ${JSON.stringify(timing)}`);
  console.log(`PASS: elapsed server clock ${JSON.stringify({ ...timing, ratio })}`);
} finally { ws.close(); }
