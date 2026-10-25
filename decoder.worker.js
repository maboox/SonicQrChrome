(() => {
  // node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i2 = 0; i2 < 31; ++i2) {
      b[i2] = start += 1 << eb[i2 - 1];
    }
    var r = new i32(b[30]);
    for (var i2 = 1; i2 < 30; ++i2) {
      for (var j = b[i2]; j < b[i2 + 1]; ++j) {
        r[j] = j - b[i2] << 5 | i2;
      }
    }
    return { b, r };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i = 0; i < 32768; ++i) {
    x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var x;
  var i;
  var hMap = (function(cd, mb, r) {
    var s = cd.length;
    var i2 = 0;
    var l = new u16(mb);
    for (; i2 < s; ++i2) {
      if (cd[i2])
        ++l[cd[i2] - 1];
    }
    var le = new u16(mb);
    for (i2 = 1; i2 < mb; ++i2) {
      le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
    }
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i2 = 0; i2 < s; ++i2) {
        if (cd[i2]) {
          var sv = i2 << 4 | cd[i2];
          var r_1 = mb - cd[i2];
          var v = le[cd[i2] - 1]++ << r_1;
          for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
            co[rev[v] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i2 = 0; i2 < s; ++i2) {
        if (cd[i2]) {
          co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
        }
      }
    }
    return co;
  });
  var flt = new u8(288);
  for (i = 0; i < 144; ++i)
    flt[i] = 8;
  var i;
  for (i = 144; i < 256; ++i)
    flt[i] = 9;
  var i;
  for (i = 256; i < 280; ++i)
    flt[i] = 7;
  var i;
  for (i = 280; i < 288; ++i)
    flt[i] = 8;
  var i;
  var fdt = new u8(32);
  for (i = 0; i < 32; ++i)
    fdt[i] = 5;
  var i;
  var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
  var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
  var max = function(a) {
    var m = a[0];
    for (var i2 = 1; i2 < a.length; ++i2) {
      if (a[i2] > m)
        m = a[i2];
    }
    return m;
  };
  var bits = function(d, p, m) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
  };
  var bits16 = function(d, p) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
  };
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0)
      s = 0;
    if (e == null || e > v.length)
      e = v.length;
    return new u8(v.subarray(s, e));
  };
  var ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    // determined by compression function
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
    // determined by unknown compression method
  ];
  var err = function(ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
      Error.captureStackTrace(e, err);
    if (!nt)
      throw e;
    return e;
  };
  var inflt = function(dat, st, buf, dict) {
    var sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l)
      return buf || new u8(0);
    var noBuf = !buf;
    var resize = noBuf || st.i != 2;
    var noSt = st.i;
    if (noBuf)
      buf = new u8(sl * 3);
    var cbuf = function(l2) {
      var bl = buf.length;
      if (l2 > bl) {
        var nbuf = new u8(Math.max(bl * 2, l2));
        nbuf.set(buf);
        buf = nbuf;
      }
    };
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    var tbts = sl * 8;
    do {
      if (!lm) {
        final = bits(dat, pos, 1);
        var type = bits(dat, pos + 1, 3);
        pos += 3;
        if (!type) {
          var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
          if (t > sl) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + l);
          buf.set(dat.subarray(s, t), bt);
          st.b = bt += l, st.p = pos = t * 8, st.f = final;
          continue;
        } else if (type == 1)
          lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
        else if (type == 2) {
          var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
          var tl = hLit + bits(dat, pos + 5, 31) + 1;
          pos += 14;
          var ldt = new u8(tl);
          var clt = new u8(19);
          for (var i2 = 0; i2 < hcLen; ++i2) {
            clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
          }
          pos += hcLen * 3;
          var clb = max(clt), clbmsk = (1 << clb) - 1;
          var clm = hMap(clt, clb, 1);
          for (var i2 = 0; i2 < tl; ) {
            var r = clm[bits(dat, pos, clbmsk)];
            pos += r & 15;
            var s = r >> 4;
            if (s < 16) {
              ldt[i2++] = s;
            } else {
              var c = 0, n = 0;
              if (s == 16)
                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
              else if (s == 17)
                n = 3 + bits(dat, pos, 7), pos += 3;
              else if (s == 18)
                n = 11 + bits(dat, pos, 127), pos += 7;
              while (n--)
                ldt[i2++] = c;
            }
          }
          var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
          lbt = max(lt);
          dbt = max(dt);
          lm = hMap(lt, lbt, 1);
          dm = hMap(dt, dbt, 1);
        } else
          err(1);
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
      }
      if (resize)
        cbuf(bt + 131072);
      var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
      var lpos = pos;
      for (; ; lpos = pos) {
        var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
        pos += c & 15;
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (!c)
          err(2);
        if (sym < 256)
          buf[bt++] = sym;
        else if (sym == 256) {
          lpos = pos, lm = null;
          break;
        } else {
          var add = sym - 254;
          if (sym > 264) {
            var i2 = sym - 257, b = fleb[i2];
            add = bits(dat, pos, (1 << b) - 1) + fl[i2];
            pos += b;
          }
          var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
          if (!d)
            err(3);
          pos += d & 15;
          var dt = fd[dsym];
          if (dsym > 3) {
            var b = fdeb[dsym];
            dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
          }
          if (pos > tbts) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + 131072);
          var end = bt + add;
          if (bt < dt) {
            var shift = dl - dt, dend = Math.min(dt, end);
            if (shift + bt < 0)
              err(3);
            for (; bt < dend; ++bt)
              buf[bt] = dict[shift + bt];
          }
          for (; bt < end; ++bt)
            buf[bt] = buf[bt - dt];
        }
      }
      st.l = lm, st.p = lpos, st.b = bt, st.f = final;
      if (lm)
        final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
  };
  var et = /* @__PURE__ */ new u8(0);
  function inflateSync(data, opts) {
    return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
  }
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }

  // src/codec.mjs
  var SAMPLE_RATE = 48e3;
  var MAX_TEXT_BYTES = 2e3;
  var MAX_AUDIO_SECONDS = 120;
  var MAX_FILE_BYTES = 25 * 1024 * 1024;
  var PROFILES = Object.freeze({
    fast: { id: 1, symbolSeconds: 0.022, frequencies: Array.from({ length: 16 }, (_, i2) => 1e3 + i2 * 400), preamble: 7800, marker: 600, amplitude: 0.68 },
    hidden: { id: 2, symbolSeconds: 0.026, frequencies: Array.from({ length: 16 }, (_, i2) => 14500 + i2 * 280), preamble: 19300, marker: 13600, amplitude: 0.055 }
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
  async function deriveKey(password, salt, usage) {
    if (!globalThis.crypto?.subtle) throw new CodecError("cryptoUnavailable");
    const base = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, [usage]);
  }
  async function unpackPacket(packet, password = "") {
    if (packet.length < 9 || packet[0] !== 83 || packet[1] !== 81 || packet[2] !== 3 || ![1, 2].includes(packet[3]) || packet[4] & ~3) throw new CodecError("invalidPacket");
    const length = packet[5] * 256 + packet[6];
    if (length > MAX_TEXT_BYTES + 36 || packet.length !== 9 + length || crc16(packet.subarray(0, -2)) !== packet.at(-2) * 256 + packet.at(-1)) throw new CodecError("invalidPacket");
    let data = packet.slice(7, -2);
    if (packet[4] & 1) {
      if (!password) throw new CodecError("passwordNeeded");
      if (data.length < 36) throw new CodecError("invalidPacket");
      const key = await deriveKey(password, data.subarray(0, 8), "decrypt");
      try {
        data = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.subarray(8, 20) }, key, data.subarray(20)));
      } catch {
        throw new CodecError("badPassword");
      }
    }
    if (packet[4] & 2) {
      try {
        data = inflateSync(data, { out: new Uint8Array(MAX_TEXT_BYTES + 1) });
      } catch {
        throw new CodecError("invalidPacket");
      }
    }
    if (data.length > MAX_TEXT_BYTES) throw new CodecError("messageTooLong");
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
      if (!text.trim() || Array.from(text).length > 500) throw new Error();
      return { text, profile: packet[3] === 1 ? "fast" : "hidden" };
    } catch {
      throw new CodecError("invalidPacket");
    }
  }
  function resample(samples, sourceRate, targetRate = SAMPLE_RATE) {
    if (![sourceRate, targetRate].every((rate) => Number.isFinite(rate) && rate >= 8e3 && rate <= 192e3)) throw new CodecError("sampleRateLow");
    if (sourceRate === targetRate) return samples;
    const result = new Float32Array(Math.round(samples.length * targetRate / sourceRate));
    for (let i2 = 0; i2 < result.length; i2++) {
      const index = i2 * sourceRate / targetRate, low = Math.floor(index), frac = index - low;
      result[i2] = (samples[low] ?? 0) * (1 - frac) + (samples[Math.min(low + 1, samples.length - 1)] ?? 0) * frac;
    }
    return result;
  }
  function power(samples, start, length, frequency, sampleRate) {
    const coefficient = 2 * Math.cos(2 * Math.PI * frequency / sampleRate);
    let a = 0, b = 0;
    const end = Math.min(samples.length, start + length);
    for (let i2 = Math.max(0, start); i2 < end; i2++) {
      const next = samples[i2] + coefficient * a - b;
      b = a;
      a = next;
    }
    return Math.max(0, a * a + b * b - coefficient * a * b);
  }
  function readSymbol(samples, start, length, profile, sampleRate) {
    let best = -1, symbol = 0;
    for (let i2 = 0; i2 < 16; i2++) {
      const score = power(samples, start, length, profile.frequencies[i2], sampleRate);
      if (score > best) {
        best = score;
        symbol = i2;
      }
    }
    return symbol;
  }
  function byteAt(samples, start, index, profile, sampleRate, symbolLength) {
    const length = Math.floor(symbolLength * 0.68), margin = symbolLength * 0.16;
    const hi = readSymbol(samples, Math.round(start + index * 2 * symbolLength + margin), length, profile, sampleRate);
    const lo = readSymbol(samples, Math.round(start + (index * 2 + 1) * symbolLength + margin), length, profile, sampleRate);
    return hi << 4 | lo;
  }
  function highPass(samples, sampleRate, cutoff) {
    const omega = 2 * Math.PI * cutoff / sampleRate, cos = Math.cos(omega), alpha = Math.sin(omega) / Math.SQRT2;
    const a0 = 1 + alpha, b0 = (1 + cos) / 2 / a0, b1 = -(1 + cos) / a0, b2 = b0;
    const a1 = -2 * cos / a0, a2 = (1 - alpha) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const out = new Float32Array(samples.length);
    for (let i2 = 0; i2 < samples.length; i2++) {
      const y = b0 * samples[i2] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      out[i2] = y;
      x2 = x1;
      x1 = samples[i2];
      y2 = y1;
      y1 = y;
    }
    return out;
  }
  function markerCandidates(samples, sampleRate, profile) {
    const window = Math.round(0.024 * sampleRate), step = Math.round(8e-3 * sampleRate);
    const groups = [];
    let group = null;
    for (let start = 0; start + window <= samples.length; start += step) {
      let energy = 0;
      for (let i2 = start; i2 < start + window; i2++) energy += samples[i2] * samples[i2];
      const tone = energy > 1e-10 ? power(samples, start, window, profile.marker, sampleRate) / (energy * window) : 0;
      if (tone > 0.1) {
        if (!group) group = { first: start, last: start, score: tone };
        group.last = start;
        group.score = Math.max(tone, group.score);
      } else if (group) {
        groups.push(group);
        group = null;
      }
    }
    if (group) groups.push(group);
    return groups.filter((g) => (g.last - g.first) / sampleRate >= 0.032).sort((a, b) => b.score - a.score).slice(0, 48).map((g) => ({ start: g.last + window / 2 + 0.05 * sampleRate, score: g.score }));
  }
  async function decodeSamples(input, sampleRate, password = "", onProgress = () => {
  }) {
    if (!Number.isFinite(sampleRate) || sampleRate > 192e3 || sampleRate < 16e3) throw new CodecError("sampleRateLow");
    if (!input.length || input.length / sampleRate > MAX_AUDIO_SECONDS + 0.1) throw new CodecError("audioTooLong");
    if (sampleRate < 16e3) throw new CodecError("sampleRateLow");
    let foundPacket = null;
    for (const [name, p] of Object.entries(PROFILES)) {
      if (sampleRate / 2 <= p.preamble + 100) continue;
      const sr = name === "fast" && sampleRate > 24e3 ? 24e3 : sampleRate;
      let samples = sr === sampleRate ? input : resample(input, sampleRate, sr);
      if (name === "hidden") samples = highPass(samples, sr, 12e3);
      const candidates = markerCandidates(samples, sr, p);
      onProgress(name === "fast" ? 0.15 : 0.6);
      for (let c = 0; c < candidates.length; c++) {
        for (const clock of [1, 0.9975, 1.0025, 0.995, 1.005]) {
          const symbolLength = Math.floor(p.symbolSeconds * SAMPLE_RATE) * sr / SAMPLE_RATE * clock;
          for (let delta = -0.036 * sr; delta <= 0.044 * sr; delta += Math.max(1, Math.round(8e-4 * sr))) {
            const start = Math.round(candidates[c].start + delta);
            if (start < 0 || start + 18 * symbolLength > samples.length) continue;
            const prefix = [83, 81, 3, p.id];
            let valid = true;
            for (let i2 = 0; i2 < prefix.length; i2++) if (byteAt(samples, start, i2, p, sr, symbolLength) !== prefix[i2]) {
              valid = false;
              break;
            }
            if (!valid) continue;
            const flags = byteAt(samples, start, 4, p, sr, symbolLength);
            const length = byteAt(samples, start, 5, p, sr, symbolLength) * 256 + byteAt(samples, start, 6, p, sr, symbolLength);
            if (flags & ~3 || length > MAX_TEXT_BYTES + 36 || start + (length + 9) * 2 * symbolLength > samples.length + 1) continue;
            const packet = new Uint8Array(length + 9);
            packet.set([...prefix, flags, length >> 8, length & 255]);
            for (let i2 = 7; i2 < packet.length; i2++) packet[i2] = byteAt(samples, start, i2, p, sr, symbolLength);
            if (crc16(packet.subarray(0, -2)) !== packet.at(-2) * 256 + packet.at(-1)) continue;
            foundPacket = packet;
            try {
              return { ...await unpackPacket(packet, password), packet };
            } catch (error) {
              if (error.code === "passwordNeeded" || error.code === "badPassword") {
                error.packet = packet;
                throw error;
              }
              throw error;
            }
          }
        }
        onProgress((name === "fast" ? 0.15 : 0.6) + (c + 1) / Math.max(1, candidates.length) * 0.3);
      }
    }
    if (foundPacket) throw new CodecError("invalidPacket");
    throw new CodecError("noMessage");
  }

  // src/decoder.worker.mjs
  self.onmessage = async ({ data }) => {
    try {
      const result = data.packet ? await unpackPacket(new Uint8Array(data.packet), data.password) : await decodeSamples(new Float32Array(data.samples), data.sampleRate, data.password, (progress) => self.postMessage({ id: data.id, progress }));
      self.postMessage({ id: data.id, result });
    } catch (error) {
      self.postMessage({ id: data.id, error: error.code || "unexpected", packet: error.packet });
    }
  };
})();
