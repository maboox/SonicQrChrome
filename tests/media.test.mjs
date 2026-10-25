import test from 'node:test';
import assert from 'node:assert/strict';
import { capturePCM, Decoder } from '../src/media.mjs';

test('Capture releases the supplied stream when AudioContext construction or setup fails', async () => {
  const original = globalThis.AudioContext;
  try {
    for (const stage of ['constructor', 'resume', 'worklet']) {
      let stopped = 0, closed = 0;
      globalThis.AudioContext = class {
        constructor() { if (stage === 'constructor') throw new Error('failed'); this.audioWorklet = { addModule: async () => { throw new Error('failed'); } }; }
        async resume() { if (stage === 'resume') throw new Error('failed'); }
        async close() { closed++; }
      };
      await assert.rejects(capturePCM({ getTracks: () => [{ stop: () => stopped++ }] }));
      assert.equal(stopped, 1, stage);
      assert.equal(closed, stage === 'constructor' ? 0 : 1, stage);
    }
  } finally { globalThis.AudioContext = original; }
});

test('Decoder cleans up workers when creation or posting fails and remains reusable', async () => {
  const original = globalThis.Worker;
  try {
    const decoder = new Decoder();
    globalThis.Worker = class { constructor() { throw new Error('failed'); } };
    await assert.rejects(decoder.decode(null), { message: 'decodeError' });
    let terminated = 0;
    globalThis.Worker = class { postMessage() { throw new Error('failed'); } terminate() { terminated++; } };
    await assert.rejects(decoder.decode(null), { message: 'decodeError' });
    assert.equal(terminated, 1);
    assert.equal(decoder.reject, null);
    assert.equal(decoder.worker, null);
  } finally { globalThis.Worker = original; }
});
