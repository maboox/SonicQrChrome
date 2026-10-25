(() => {
  // src/codec.mjs
  var SAMPLE_RATE = 48e3;
  var MAX_TEXT_BYTES = 2e3;
  var MAX_SIGNAL_SECONDS = 117;
  var MAX_FILE_BYTES = 25 * 1024 * 1024;
  var PROFILES = Object.freeze({
    fast: { id: 1, symbolSeconds: 0.022, frequencies: Array.from({ length: 16 }, (_, i) => 1e3 + i * 400), preamble: 7800, marker: 600, amplitude: 0.68 },
    hidden: { id: 2, symbolSeconds: 0.026, frequencies: Array.from({ length: 16 }, (_, i) => 14500 + i * 280), preamble: 19300, marker: 13600, amplitude: 0.055 }
  });
  var encoder = new TextEncoder();
  var CodecError = class extends Error {
    constructor(code) {
      super(code);
      this.name = "CodecError";
      this.code = code;
    }
  };
  function crc16(bytes) {
    let crc = 65535;
    for (const byte of bytes) {
      crc ^= byte << 8;
      for (let j = 0; j < 8; j++) crc = crc & 32768 ? (crc << 1 ^ 4129) & 65535 : crc << 1 & 65535;
    }
    return crc;
  }
  function signalDuration(packetLength, profileName = "fast") {
    const p = PROFILES[profileName];
    if (!p || !Number.isInteger(packetLength) || packetLength < 9 || packetLength > MAX_TEXT_BYTES + 45) throw new CodecError("invalidPacket");
    return (Math.round(0.36 * SAMPLE_RATE) + packetLength * 2 * Math.floor(p.symbolSeconds * SAMPLE_RATE) + Math.round(0.06 * SAMPLE_RATE)) / SAMPLE_RATE;
  }
  function writeTone(out, start, count, frequency, amplitude) {
    const fade = Math.min(150, Math.floor(count / 7));
    for (let i = 0; i < count; i++) {
      const envelope = Math.min(1, i / fade, (count - 1 - i) / fade);
      out[start + i] = Math.sin(2 * Math.PI * frequency * i / SAMPLE_RATE) * amplitude * envelope;
    }
  }
  function modulate(packet, profileName = "fast", amplitude) {
    const p = PROFILES[profileName];
    if (!p) throw new CodecError("invalidPacket");
    if (signalDuration(packet.length, profileName) > MAX_SIGNAL_SECONDS) throw new CodecError("signalTooLong");
    if (amplitude != null && (!Number.isFinite(amplitude) || amplitude < 0 || amplitude > 1)) throw new CodecError("invalidPacket");
    const symbolLength = Math.floor(p.symbolSeconds * SAMPLE_RATE);
    const dataStart = Math.round(0.36 * SAMPLE_RATE);
    const out = new Float32Array(dataStart + packet.length * 2 * symbolLength + Math.round(0.06 * SAMPLE_RATE));
    const amp = amplitude ?? p.amplitude;
    writeTone(out, 0, Math.round(0.16 * SAMPLE_RATE), p.preamble, amp);
    writeTone(out, Math.round(0.21 * SAMPLE_RATE), Math.round(0.1 * SAMPLE_RATE), p.marker, amp);
    let position = dataStart;
    for (const byte of packet) {
      writeTone(out, position, symbolLength, p.frequencies[byte >> 4], amp);
      position += symbolLength;
      writeTone(out, position, symbolLength, p.frequencies[byte & 15], amp);
      position += symbolLength;
    }
    return out;
  }

  // src/mixer.mjs
  var KEY = "__sonicQRMixerV2__";
  if (!globalThis[KEY] && globalThis.AudioContext && navigator.mediaDevices?.getUserMedia) {
    if (globalThis.__sonicQRMixerV1__) {
      globalThis.__sonicQRMixerV1__.disarm();
      Object.defineProperty(globalThis, KEY, { value: Object.freeze({ version: 2, arm() {
        throw new Error("reloadRequired");
      }, disarm() {
        return this.status();
      }, status() {
        return { phase: "error", detail: "reloadRequired", active: false, version: 2 };
      } }) });
    } else install();
  }
  function install() {
    const nativeGUM = navigator.mediaDevices.getUserMedia;
    const nativeSource = AudioContext.prototype.createMediaStreamSource;
    const NativeRecorder = globalThis.MediaRecorder;
    const nativeStart = NativeRecorder?.prototype.start;
    const sessions = /* @__PURE__ */ new Set(), tracks = /* @__PURE__ */ new WeakMap();
    let armed = null, latest = null, prepared = null, expires = null;
    let micRequests = 0, recorderStarts = 0;
    let last = { phase: "idle", duration: 0, elapsed: 0, detail: "" };
    const isMic = (stream) => stream instanceof MediaStream && stream.getAudioTracks().length && !stream.getVideoTracks().length && !stream.getAudioTracks().some((t) => t.getSettings().displaySurface);
    const sessionFor = (stream) => stream?.getAudioTracks?.().map((t) => tracks.get(t)).find((s) => s && !s.closed);
    const active = (s) => !s.closed && (s.recording > 0 || s.tone && !s.complete && !s.interrupted);
    const elapsed = (s) => s.startedAt == null ? 0 : Math.max(0, Math.min(s.duration, s.context.currentTime - s.startedAt));
    function closePrepared() {
      if (prepared) void prepared.close().catch(() => {
      });
      prepared = null;
    }
    function clearArm() {
      armed = null;
      clearTimeout(expires);
      closePrepared();
    }
    function prepare() {
      if (!prepared || prepared.state === "closed") prepared = new AudioContext({ sampleRate: SAMPLE_RATE });
      void prepared.resume().catch(() => {
      });
      return prepared;
    }
    function unlock() {
      if (prepared) void prepared.resume().catch(() => {
      });
      for (const s of sessions) if (s.context.state === "suspended") void s.context.resume().catch(() => {
      });
    }
    addEventListener("pointerdown", unlock, true);
    addEventListener("keydown", unlock, true);
    function snapshot() {
      if (armed && Date.now() > armed.expiresAt) {
        clearArm();
        last = { ...last, phase: "expired" };
      }
      const s = latest && !latest.closed ? latest : null;
      const pending = s?.tone && !s.complete && !s.interrupted;
      const progress = pending ? { phase: s.context.state !== "running" ? "blocked" : s.startedAt == null ? "waiting" : "recording", duration: s.duration, elapsed: elapsed(s), detail: s.context.state !== "running" ? "audioBlocked" : "" } : last;
      return { ...progress, active: [...sessions].some(active), version: 2, route: s?.route || last.route || "", context: s?.context.state || prepared?.state || "", outputPeak: s?.peak || last.outputPeak || 0, micRequests, recorderStarts };
    }
    function validate(config) {
      const p = Uint8Array.from(config?.packet || []);
      if (!Array.isArray(config?.packet) || config.packet.some((x) => !Number.isInteger(x) || x < 0 || x > 255) || p.length < 9 || p.length > 2045 || p[0] !== 83 || p[1] !== 81 || p[2] !== 3 || p[3] !== PROFILES[config.profile]?.id || p[4] & ~3 || p.length !== 9 + p[5] * 256 + p[6] || crc16(p.subarray(0, -2)) !== p.at(-2) * 256 + p.at(-1)) throw new Error("invalidPacket");
      if (!Number.isFinite(config.amplitude) || config.amplitude < 0.025 || config.amplitude > (config.profile === "hidden" ? 0.12 : 0.42)) throw new Error("invalidPacket");
      if (signalDuration(p.length, config.profile) > MAX_SIGNAL_SECONDS) throw new Error("signalTooLong");
      return { packet: p, profile: config.profile, amplitude: config.amplitude, expiresAt: Date.now() + 12e4 };
    }
    function attachTone(s, config) {
      const samples = modulate(config.packet, config.profile, config.amplitude);
      const tone = s.context.createBufferSource();
      const buffer = s.context.createBuffer(1, samples.length, SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);
      tone.buffer = buffer;
      tone.connect(s.toneGain);
      s.tone = tone;
      s.duration = samples.length / SAMPLE_RATE;
      s.startedAt = null;
      s.complete = false;
      s.interrupted = false;
      s.peak = 0;
      latest = s;
      last = { phase: "waiting", duration: s.duration, elapsed: 0, detail: "", route: s.route };
      tone.onended = () => {
        tone.disconnect();
        if (s.tone === tone && !s.closed && !s.interrupted) {
          s.complete = true;
          last = { phase: "complete", duration: s.duration, elapsed: s.duration, detail: "", route: s.route, outputPeak: s.peak };
        }
      };
    }
    function startTone(s, route) {
      if (!s || s.closed || s.startedAt != null || s.interrupted || s.complete) return;
      s.route = route;
      if (s.context.state !== "running") {
        last = { ...last, phase: "blocked", detail: "audioBlocked" };
        return;
      }
      s.startedAt = s.context.currentTime + 0.25;
      s.tone.start(s.startedAt);
    }
    function interrupt(s) {
      if (s.closed || s.complete || s.interrupted) return;
      s.interrupted = true;
      try {
        s.tone.stop();
      } catch {
      }
      s.tone.disconnect();
      last = { phase: "incomplete", duration: s.duration, elapsed: elapsed(s), detail: "", route: s.route, outputPeak: s.peak };
    }
    function cleanup(s, stopInputs = false) {
      if (s.closed) return;
      interrupt(s);
      s.closed = true;
      clearInterval(s.guard);
      for (const t of s.outputs) MediaStreamTrack.prototype.stop.call(t);
      if (stopInputs) s.stream.getTracks().forEach((t) => t.stop());
      for (const node of [s.source, s.voice, s.toneGain, s.analyser]) node.disconnect();
      void s.context.close().catch(() => {
      });
      sessions.delete(s);
    }
    function registerTrack(s, track) {
      if (tracks.has(track)) return;
      tracks.set(track, s);
      s.outputs.add(track);
      const stop = track.stop.bind(track), clone = track.clone.bind(track);
      track.stop = () => {
        stop();
        s.outputs.delete(track);
        if (!s.outputs.size) cleanup(s, s.ownsInput);
      };
      track.clone = () => {
        const t = clone();
        registerTrack(s, t);
        return t;
      };
      track.addEventListener("ended", () => {
        s.outputs.delete(track);
        if (!s.outputs.size) cleanup(s, s.ownsInput);
      }, { once: true });
    }
    function registerStream(s, stream) {
      stream.getAudioTracks().forEach((t) => registerTrack(s, t));
      const clone = stream.clone.bind(stream);
      stream.clone = () => {
        const copy = clone();
        registerStream(s, copy);
        return copy;
      };
      return stream;
    }
    function buildMix(stream, config, ownsInput) {
      const context = prepared || prepare();
      prepared = null;
      try {
        const output = context.createMediaStreamDestination();
        output.channelCount = 1;
        const source = nativeSource.call(context, stream);
        const voice = context.createGain();
        voice.gain.value = 0.56;
        const toneGain = context.createGain(), analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(voice);
        voice.connect(analyser);
        toneGain.connect(analyser);
        analyser.connect(output);
        const s = { context, output, source, voice, toneGain, analyser, stream, ownsInput, outputs: /* @__PURE__ */ new Set(), recording: 0, closed: false, route: "microphone", peak: 0 };
        sessions.add(s);
        registerStream(s, output.stream);
        attachTone(s, config);
        const inputs = stream.getAudioTracks(), meter = new Float32Array(analyser.fftSize);
        s.guard = setInterval(() => {
          toneGain.gain.value = inputs.some((t) => t.enabled && t.readyState === "live") ? 1 : 0;
          analyser.getFloatTimeDomainData(meter);
          for (const v of meter) s.peak = Math.max(s.peak, Math.abs(v));
          for (const t of s.outputs) if (t.readyState === "ended") s.outputs.delete(t);
          if (!s.outputs.size) cleanup(s, s.ownsInput);
          if (!inputs.some((t) => t.readyState === "live")) cleanup(s);
        }, 80);
        inputs.forEach((t) => t.addEventListener("ended", () => cleanup(s), { once: true }));
        return s;
      } catch (error) {
        void context.close().catch(() => {
        });
        throw error;
      }
    }
    function consume(stream, ownsInput = false) {
      snapshot();
      const previous = sessionFor(stream);
      if (!isMic(stream)) return null;
      if (!armed) return previous || null;
      const config = armed;
      if (previous) {
        attachTone(previous, config);
        clearArm();
        return previous;
      }
      if (prepared?.state !== "running") {
        clearArm();
        last = { phase: "error", detail: "audioBlocked", duration: 0, elapsed: 0 };
        return null;
      }
      try {
        const s = buildMix(stream, config, ownsInput);
        clearArm();
        return s;
      } catch (error) {
        clearArm();
        last = { phase: "error", detail: error.message, duration: 0, elapsed: 0 };
        return null;
      }
    }
    navigator.mediaDevices.getUserMedia = async function(constraints) {
      const eligible = !!constraints?.audio && !constraints.video && !constraints.audio?.mandatory?.chromeMediaSource;
      const requestedArm = eligible ? armed : null;
      if (eligible) micRequests++;
      let stream;
      try {
        stream = await nativeGUM.call(this, constraints);
      } catch (error) {
        if (requestedArm && requestedArm === armed) {
          clearArm();
          last = { phase: "error", duration: 0, elapsed: 0, detail: error.name };
        }
        throw error;
      }
      if (!requestedArm || requestedArm !== armed || !isMic(stream)) return stream;
      const context = prepare();
      if (context.state !== "running") await Promise.race([context.resume().catch(() => {
      }), new Promise((r) => setTimeout(r, 1e3))]);
      if (requestedArm !== armed) return stream;
      const s = consume(stream, true);
      return s ? s.output.stream : stream;
    };
    AudioContext.prototype.createMediaStreamSource = function(stream) {
      const existing = sessionFor(stream), s = consume(stream);
      const node = nativeSource.call(this, existing ? stream : s ? s.output.stream : stream);
      if (s) {
        let begin = function() {
          if (connected && context.state === "running") startTone(s, "web-audio");
        };
        const connect = node.connect, context = this;
        let connected = false;
        node.connect = function(...args) {
          const result = connect.apply(this, args);
          connected = true;
          begin();
          return result;
        };
        context.addEventListener("statechange", begin);
        const disconnect = node.disconnect;
        node.disconnect = function(...args) {
          const result = disconnect.apply(this, args);
          if (!args.length) {
            connected = false;
            context.removeEventListener("statechange", begin);
          }
          return result;
        };
      }
      return node;
    };
    if (NativeRecorder) {
      class VoiceRecorder extends NativeRecorder {
        constructor(stream, options) {
          const existing = sessionFor(stream), s = consume(stream);
          try {
            super(existing ? stream : s ? s.output.stream : stream, options);
          } catch (error) {
            if (s && !existing) cleanup(s);
            throw error;
          }
        }
      }
      NativeRecorder.prototype.start = function(...args) {
        let s = sessionFor(this.stream);
        if (s && armed && this.state === "inactive") s = consume(this.stream);
        const result = nativeStart.apply(this, args);
        recorderStarts++;
        if (!s && armed && isMic(this.stream)) last = { ...last, detail: "recorderUnmixed" };
        if (s) {
          s.recording++;
          startTone(s, "media-recorder");
          const finished = () => {
            this.removeEventListener("stop", finished);
            this.removeEventListener("error", finished);
            this.removeEventListener("pause", paused);
            s.recording = Math.max(0, s.recording - 1);
            interrupt(s);
            if (!s.ownsInput) cleanup(s);
          };
          const paused = () => interrupt(s);
          this.addEventListener("stop", finished);
          this.addEventListener("error", finished);
          this.addEventListener("pause", paused);
        }
        return result;
      };
      globalThis.MediaRecorder = VoiceRecorder;
    }
    Object.defineProperty(globalThis, KEY, { value: Object.freeze({
      version: 2,
      prepare() {
        prepare();
        return snapshot();
      },
      arm(config) {
        if ([...sessions].some(active)) throw new Error("recordingBusy");
        const valid = validate(config);
        clearTimeout(expires);
        armed = valid;
        prepare();
        latest = null;
        last = { phase: "armed", duration: modulate(valid.packet, valid.profile, valid.amplitude).length / SAMPLE_RATE, elapsed: 0, detail: "" };
        expires = setTimeout(() => {
          if (armed) {
            clearArm();
            last.phase = "expired";
          }
        }, 12e4);
        return snapshot();
      },
      disarm() {
        clearArm();
        sessions.forEach(interrupt);
        if (![...sessions].some(active)) last = { ...last, phase: "idle", detail: "" };
        return snapshot();
      },
      startSignal() {
        if (!latest || latest.closed || !latest.tone) throw new Error("noMixedStream");
        startTone(latest, "manual");
        return snapshot();
      },
      status: snapshot
    }) });
    addEventListener("pagehide", () => {
      clearArm();
      sessions.forEach((s) => cleanup(s, s.ownsInput));
    });
  }
})();
