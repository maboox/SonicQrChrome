import { MAX_AUDIO_SECONDS, MAX_FILE_BYTES } from './codec.mjs';
export async function readAudio(blob) {
  if (!blob?.size) throw new Error('fileError');
  if (blob.size > MAX_FILE_BYTES) throw new Error('fileTooLarge');
  const context = new AudioContext({ sampleRate: 48000 });
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    if (buffer.duration > MAX_AUDIO_SECONDS) throw new Error('audioTooLong');
    const samples = new Float32Array(buffer.length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const channel = buffer.getChannelData(ch);
      for (let i = 0; i < samples.length; i++) samples[i] += channel[i] / buffer.numberOfChannels;
    }
    return { samples, sampleRate: buffer.sampleRate };
  } catch (error) { if (error.message === 'audioTooLong') throw error; throw new Error('fileError'); }
  finally { await context.close(); }
}
export class Decoder {
  constructor() { this.worker = null; this.reject = null; }
  decode(audio, password = '', packet = null, onProgress = () => {}) {
    this.cancel();
    return new Promise((resolve, reject) => {
      this.reject = reject;
      const worker = this.worker = new Worker('./decoder.worker.js');
      this.timeout = setTimeout(() => { this.cancel('decodeTimeout'); }, 45000);
      worker.onmessage = ({ data }) => {
        if (data.progress != null) { onProgress(data.progress); return; }
        clearTimeout(this.timeout); worker.terminate(); this.worker = null; this.reject = null;
        if (data.error) reject(Object.assign(new Error(data.error), { packet: data.packet })); else resolve(data.result);
      };
      worker.onerror = () => this.cancel('decodeError');
      worker.postMessage(packet ? { id: 1, packet, password } : { id: 1, ...audio, password });
    });
  }
  cancel(code = 'cancelled') {
    clearTimeout(this.timeout); this.worker?.terminate(); this.worker = null;
    const reject = this.reject; this.reject = null; reject?.(new Error(code));
  }
}
export async function capturePCM(stream, { monitor = false, onTime = () => {}, onLimit = () => {} } = {}) {
  const context = new AudioContext({ sampleRate: 48000 });
  let source, node, frames = 0, flushResolve, stopped = false;
  const chunks = [];
  try {
    await context.resume();
    await context.audioWorklet.addModule('./recorder.worklet.js');
    node = new AudioWorkletNode(context, 'pcm-recorder');
    source = context.createMediaStreamSource(stream);
    node.port.onmessage = ({ data }) => {
      if (data === 'stopped') { flushResolve?.(); return; }
      if (frames < MAX_AUDIO_SECONDS * context.sampleRate) {
        const chunk = data.subarray(0, Math.max(0, MAX_AUDIO_SECONDS * context.sampleRate - frames));
        chunks.push(chunk); frames += chunk.length; onTime(frames / context.sampleRate);
      }
      if (frames >= MAX_AUDIO_SECONDS * context.sampleRate) onLimit();
    };
    source.connect(node); node.connect(context.destination);
    if (monitor) source.connect(context.destination);
    const timer = setTimeout(onLimit, MAX_AUDIO_SECONDS * 1000);
    return {
      async stop() {
        if (stopped) return null;
        stopped = true; clearTimeout(timer);
        await new Promise(resolve => { flushResolve = resolve; node.port.postMessage('stop'); setTimeout(resolve, 250); });
        stream.getTracks().forEach(track => track.stop()); source.disconnect(); node.disconnect();
        const sampleRate = context.sampleRate;
        await context.close();
        const samples = new Float32Array(frames); let offset = 0;
        for (const chunk of chunks) { samples.set(chunk, offset); offset += chunk.length; }
        return { samples, sampleRate };
      }
    };
  } catch (error) { stream.getTracks().forEach(track => track.stop()); source?.disconnect(); node?.disconnect(); await context.close(); throw error; }
}
export function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
