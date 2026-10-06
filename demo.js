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
  var flm = /* @__PURE__ */ hMap(flt, 9, 0);
  var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
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
  var wbits = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
  };
  var wbits16 = function(d, p, v) {
    v <<= p & 7;
    var o = p / 8 | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
  };
  var hTree = function(d, mb) {
    var t = [];
    for (var i2 = 0; i2 < d.length; ++i2) {
      if (d[i2])
        t.push({ s: i2, f: d[i2] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
      return { t: et, l: 0 };
    if (s == 1) {
      var v = new u8(t[0].s + 1);
      v[t[0].s] = 1;
      return { t: v, l: 1 };
    }
    t.sort(function(a, b) {
      return a.f - b.f;
    });
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
    t[0] = { s: -1, f: l.f + r.f, l, r };
    while (i1 != s - 1) {
      l = t[t[i0].f < t[i22].f ? i0++ : i22++];
      r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
      t[i1++] = { s: -1, f: l.f + r.f, l, r };
    }
    var maxSym = t2[0].s;
    for (var i2 = 1; i2 < s; ++i2) {
      if (t2[i2].s > maxSym)
        maxSym = t2[i2].s;
    }
    var tr2 = new u16(maxSym + 1);
    var mbt = ln(t[i1 - 1], tr2, 0);
    if (mbt > mb) {
      var i2 = 0, dt = 0;
      var lft = mbt - mb, cst = 1 << lft;
      t2.sort(function(a, b) {
        return tr2[b.s] - tr2[a.s] || a.f - b.f;
      });
      for (; i2 < s; ++i2) {
        var i2_1 = t2[i2].s;
        if (tr2[i2_1] > mb) {
          dt += cst - (1 << mbt - tr2[i2_1]);
          tr2[i2_1] = mb;
        } else
          break;
      }
      dt >>= lft;
      while (dt > 0) {
        var i2_2 = t2[i2].s;
        if (tr2[i2_2] < mb)
          dt -= 1 << mb - tr2[i2_2]++ - 1;
        else
          ++i2;
      }
      for (; i2 >= 0 && dt; --i2) {
        var i2_3 = t2[i2].s;
        if (tr2[i2_3] == mb) {
          --tr2[i2_3];
          ++dt;
        }
      }
      mbt = mb;
    }
    return { t: new u8(tr2), l: mbt };
  };
  var ln = function(n, l, d) {
    return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
  };
  var lc = function(c) {
    var s = c.length;
    while (s && !c[--s])
      ;
    var cl = new u16(++s);
    var cli = 0, cln = c[0], cls = 1;
    var w = function(v) {
      cl[cli++] = v;
    };
    for (var i2 = 1; i2 <= s; ++i2) {
      if (c[i2] == cln && i2 != s)
        ++cls;
      else {
        if (!cln && cls > 2) {
          for (; cls > 138; cls -= 138)
            w(32754);
          if (cls > 2) {
            w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
            cls = 0;
          }
        } else if (cls > 3) {
          w(cln), --cls;
          for (; cls > 6; cls -= 6)
            w(8304);
          if (cls > 2)
            w(cls - 3 << 5 | 8208), cls = 0;
        }
        while (cls--)
          w(cln);
        cls = 1;
        cln = c[i2];
      }
    }
    return { c: cl.subarray(0, cli), n: s };
  };
  var clen = function(cf, cl) {
    var l = 0;
    for (var i2 = 0; i2 < cl.length; ++i2)
      l += cf[i2] * cl[i2];
    return l;
  };
  var wfblk = function(out, pos, dat) {
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i2 = 0; i2 < s; ++i2)
      out[o + i2 + 4] = dat[i2];
    return (o + 4 + s) * 8;
  };
  var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
    var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i2 = 0; i2 < lclt.length; ++i2)
      ++lcfreq[lclt[i2] & 31];
    for (var i2 = 0; i2 < lcdt.length; ++i2)
      ++lcfreq[lcdt[i2] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
      ;
    var flen = bl + 5 << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
      return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
      lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
      var llm = hMap(lct, mlcb, 0);
      wbits(out, p, nlc - 257);
      wbits(out, p + 5, ndc - 1);
      wbits(out, p + 10, nlcc - 4);
      p += 14;
      for (var i2 = 0; i2 < nlcc; ++i2)
        wbits(out, p + 3 * i2, lct[clim[i2]]);
      p += 3 * nlcc;
      var lcts = [lclt, lcdt];
      for (var it = 0; it < 2; ++it) {
        var clct = lcts[it];
        for (var i2 = 0; i2 < clct.length; ++i2) {
          var len = clct[i2] & 31;
          wbits(out, p, llm[len]), p += lct[len];
          if (len > 15)
            wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
        }
      }
    } else {
      lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i2 = 0; i2 < li; ++i2) {
      var sym = syms[i2];
      if (sym > 255) {
        var len = sym >> 18 & 31;
        wbits16(out, p, lm[len + 257]), p += ll[len + 257];
        if (len > 7)
          wbits(out, p, sym >> 23 & 31), p += fleb[len];
        var dst = sym & 31;
        wbits16(out, p, dm[dst]), p += dl[dst];
        if (dst > 3)
          wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
      } else {
        wbits16(out, p, lm[sym]), p += ll[sym];
      }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
  };
  var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
  var et = /* @__PURE__ */ new u8(0);
  var dflt = function(dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
      if (pos)
        w[0] = st.r >> 3;
      var opt = deo[lvl - 1];
      var n = opt >> 13, c = opt & 8191;
      var msk_1 = (1 << plvl) - 1;
      var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
      var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
      var hsh = function(i3) {
        return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
      };
      var syms = new i32(25e3);
      var lf = new u16(288), df = new u16(32);
      var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
      for (; i2 + 2 < s; ++i2) {
        var hv = hsh(i2);
        var imod = i2 & 32767, pimod = head[hv];
        prev[imod] = pimod;
        head[hv] = imod;
        if (wi <= i2) {
          var rem = s - i2;
          if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
            pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
            li = lc_1 = eb = 0, bs = i2;
            for (var j = 0; j < 286; ++j)
              lf[j] = 0;
            for (var j = 0; j < 30; ++j)
              df[j] = 0;
          }
          var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
          if (rem > 2 && hv == hsh(i2 - dif)) {
            var maxn = Math.min(n, rem) - 1;
            var maxd = Math.min(32767, i2);
            var ml = Math.min(258, rem);
            while (dif <= maxd && --ch_1 && imod != pimod) {
              if (dat[i2 + l] == dat[i2 + l - dif]) {
                var nl = 0;
                for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                  ;
                if (nl > l) {
                  l = nl, d = dif;
                  if (nl > maxn)
                    break;
                  var mmd = Math.min(dif, nl - 2);
                  var md = 0;
                  for (var j = 0; j < mmd; ++j) {
                    var ti = i2 - dif + j & 32767;
                    var pti = prev[ti];
                    var cd = ti - pti & 32767;
                    if (cd > md)
                      md = cd, pimod = ti;
                  }
                }
              }
              imod = pimod, pimod = prev[imod];
              dif += imod - pimod & 32767;
            }
          }
          if (d) {
            syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
            var lin = revfl[l] & 31, din = revfd[d] & 31;
            eb += fleb[lin] + fdeb[din];
            ++lf[257 + lin];
            ++df[din];
            wi = i2 + l;
            ++lc_1;
          } else {
            syms[li++] = dat[i2];
            ++lf[dat[i2]];
          }
        }
      }
      for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
        syms[li++] = dat[i2];
        ++lf[dat[i2]];
      }
      pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
      if (!lst) {
        st.r = pos & 7 | w[pos / 8 | 0] << 3;
        pos -= 7;
        st.h = head, st.p = prev, st.i = i2, st.w = wi;
      }
    } else {
      for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
        var e = i2 + 65535;
        if (e >= s) {
          w[pos / 8 | 0] = lst;
          e = s;
        }
        pos = wfblk(w, pos + 1, dat.subarray(i2, e));
      }
      st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
  };
  var dopt = function(dat, opt, pre, post, st) {
    if (!st) {
      st = { l: 1 };
      if (opt.dictionary) {
        var dict = opt.dictionary.subarray(-32768);
        var newDat = new u8(dict.length + dat.length);
        newDat.set(dict);
        newDat.set(dat, dict.length);
        dat = newDat;
        st.w = dict.length;
      }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
  };
  function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
  }
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }

  // src/codec.mjs
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
  async function makePacket(text, password = "", profileId = 1) {
    const original = encoder.encode(text);
    if (!text.trim()) throw new CodecError("emptyMessage");
    if (Array.from(text).length > 500 || original.length > MAX_TEXT_BYTES) throw new CodecError("messageTooLong");
    if (![1, 2].includes(profileId)) throw new CodecError("invalidPacket");
    const compressed = deflateSync(original, { level: 6 });
    let data = compressed.length + 2 < original.length ? compressed : original;
    let flags = data === compressed ? 2 : 0;
    if (password) {
      const salt = crypto.getRandomValues(new Uint8Array(8));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt, "encrypt");
      const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
      data = new Uint8Array(20 + encrypted.length);
      data.set(salt);
      data.set(iv, 8);
      data.set(encrypted, 20);
      flags |= 1;
    }
    const packet = new Uint8Array(9 + data.length);
    packet.set([83, 81, 3, profileId, flags, data.length >> 8, data.length & 255]);
    packet.set(data, 7);
    const check = crc16(packet.subarray(0, -2));
    packet[packet.length - 2] = check >> 8;
    packet[packet.length - 1] = check & 255;
    return packet;
  }

  // src/media.mjs
  async function readAudio(blob) {
    if (!blob?.size) throw new Error("fileError");
    if (blob.size > MAX_FILE_BYTES) throw new Error("fileTooLarge");
    const context = new AudioContext({ sampleRate: 48e3 });
    try {
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      if (buffer.duration > MAX_AUDIO_SECONDS) throw new Error("audioTooLong");
      const samples = new Float32Array(buffer.length);
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const channel = buffer.getChannelData(ch);
        for (let i2 = 0; i2 < samples.length; i2++) samples[i2] += channel[i2] / buffer.numberOfChannels;
      }
      return { samples, sampleRate: buffer.sampleRate };
    } catch (error) {
      if (error.message === "audioTooLong") throw error;
      throw new Error("fileError");
    } finally {
      await context.close();
    }
  }
  var Decoder = class {
    constructor() {
      this.worker = null;
      this.reject = null;
    }
    decode(audio, password = "", packet = null, onProgress = () => {
    }) {
      this.cancel();
      return new Promise((resolve, reject) => {
        this.reject = reject;
        const worker = this.worker = new Worker("./decoder.worker.js");
        this.timeout = setTimeout(() => {
          this.cancel("decodeTimeout");
        }, 45e3);
        worker.onmessage = ({ data }) => {
          if (data.progress != null) {
            onProgress(data.progress);
            return;
          }
          clearTimeout(this.timeout);
          worker.terminate();
          this.worker = null;
          this.reject = null;
          if (data.error) reject(Object.assign(new Error(data.error), { packet: data.packet }));
          else resolve(data.result);
        };
        worker.onerror = () => this.cancel("decodeError");
        worker.postMessage(packet ? { id: 1, packet, password } : { id: 1, ...audio, password });
      });
    }
    cancel(code = "cancelled") {
      clearTimeout(this.timeout);
      this.worker?.terminate();
      this.worker = null;
      const reject = this.reject;
      this.reject = null;
      reject?.(new Error(code));
    }
  };
  function download(blob, name) {
    const url2 = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url2;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url2), 3e4);
  }

  // src/i18n.mjs
  var I18N = {
    fa: {
      step2: "\u06F2",
      mixPrivacy: "\u0645\u062A\u0646 \u0648 \u0635\u0648\u062A \u0645\u062D\u0644\u06CC \u067E\u0631\u062F\u0627\u0632\u0634 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0633\u0627\u06CC\u062A \u0628\u0647 \u0648\u0648\u06CC\u0633 \u062A\u0631\u06A9\u06CC\u0628\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0627\u0631\u062F. \u0628\u0631\u0627\u06CC \u0645\u062A\u0646 \u062E\u0635\u0648\u0635\u06CC \u0631\u0645\u0632 \u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646.",
      privacyLink: "\u062D\u0631\u06CC\u0645 \u062E\u0635\u0648\u0635\u06CC",
      tagline: "\u0645\u062A\u0646 \u06A9\u0648\u062A\u0627\u0647\u060C \u0647\u0645\u0631\u0627\u0647 \u0648\u0648\u06CC\u0633",
      blocked: "\u0645\u0631\u0648\u0631\u06AF\u0631 \u0645\u0633\u06CC\u0631 \u0635\u062F\u0627 \u0631\u0627 \u0645\u0639\u0644\u0642 \u06A9\u0631\u062F\u0647\u061B \u0631\u0648\u06CC \u0635\u0641\u062D\u0647\u0654 \u0633\u0627\u06CC\u062A \u06A9\u0644\u06CC\u06A9 \u06A9\u0646.",
      audioBlocked: "\u0645\u0633\u06CC\u0631 \u0635\u062F\u0627 \u0628\u0627\u0632 \u0646\u0634\u062F. \u062A\u0631\u06A9\u06CC\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0641\u0639\u0627\u0644 \u06A9\u0646\u060C \u0633\u067E\u0633 \u0631\u0648\u06CC \u062E\u0648\u062F \u0635\u0641\u062D\u0647\u0654 \u0633\u0627\u06CC\u062A \u06A9\u0644\u06CC\u06A9 \u06A9\u0646 \u0648 \u0636\u0628\u0637 \u0631\u0627 \u0634\u0631\u0648\u0639 \u06A9\u0646.",
      reloadRequired: "\u06A9\u062F \u0646\u0633\u062E\u0647\u0654 \u0642\u0628\u0644\u06CC \u0647\u0646\u0648\u0632 \u062F\u0627\u062E\u0644 \u0633\u0627\u06CC\u062A \u0627\u0633\u062A\u061B \u062A\u0628 \u0633\u0627\u06CC\u062A \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646.",
      diagnostics: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0633\u06CC\u0631 \u0636\u0628\u0637",
      copyDiagnostics: "\u06A9\u067E\u06CC \u06AF\u0632\u0627\u0631\u0634 \u0639\u06CC\u0628\u200C\u06CC\u0627\u0628\u06CC",
      diagnosticsCopied: "\u06AF\u0632\u0627\u0631\u0634 \u0628\u062F\u0648\u0646 \u0645\u062A\u0646\u060C \u0631\u0645\u0632 \u0648 \u0635\u0648\u062A \u06A9\u067E\u06CC \u0634\u062F.",
      pathNone: "\u0645\u0633\u06CC\u0631 \u0636\u0628\u0637 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0646\u0634\u062F\u0647",
      pathMicrophone: "\u0648\u0631\u0648\u062F\u06CC \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u0622\u0645\u0627\u062F\u0647",
      pathManual: "\u0634\u0631\u0648\u0639 \u062F\u0633\u062A\u06CC \u0631\u0648\u06CC \u0648\u0631\u0648\u062F\u06CC \u062A\u0631\u06A9\u06CC\u0628\u06CC",
      startSignal: "\u0636\u0628\u0637 \u0633\u0627\u06CC\u062A \u0634\u0631\u0648\u0639 \u0634\u062F\u0647\u061B \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646",
      manualTip: "\u0627\u06AF\u0631 \u0636\u0628\u0637 \u0633\u0627\u06CC\u062A \u0634\u0631\u0648\u0639 \u0634\u062F\u0647 \u0648\u0644\u06CC \u0648\u0636\u0639\u06CC\u062A \u0647\u0646\u0648\u0632 \u0645\u0646\u062A\u0638\u0631 \u0627\u0633\u062A\u060C \u0627\u06CC\u0646 \u062F\u06A9\u0645\u0647 \u0631\u0627 \u0628\u0632\u0646 \u0648 \u0627\u0632 \u0627\u06CC\u0646 \u0644\u062D\u0638\u0647 \u062A\u0627 \u067E\u0627\u06CC\u0627\u0646 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0636\u0628\u0637 \u06A9\u0646.",
      recorderUnmixed: "\u0633\u0627\u06CC\u062A \u0636\u0628\u0637\u200C\u06A9\u0646\u0646\u062F\u0647\u200C\u0627\u06CC \u0628\u0627 \u0648\u0631\u0648\u062F\u06CC \u0642\u0628\u0644\u06CC \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. \u0636\u0628\u0637 \u0631\u0627 \u0645\u062A\u0648\u0642\u0641 \u06A9\u0646\u060C \u062F\u0633\u062A\u0631\u0633\u06CC \u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u0627\u06CC\u0646 \u0633\u0627\u06CC\u062A \u0631\u0627 \u0641\u0639\u0627\u0644 \u06A9\u0646 \u0648 \u062A\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646.",
      noMixedStream: "\u0648\u0631\u0648\u062F\u06CC \u062A\u0631\u06A9\u06CC\u0628\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F\u0647\u061B \u062F\u0633\u062A\u0631\u0633\u06CC \u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u0633\u0627\u06CC\u062A \u0631\u0627 \u0641\u0639\u0627\u0644 \u0648 \u062A\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646.",
      pathRecorder: "\u0636\u0628\u0637 MediaRecorder",
      pathWebAudio: "\u0636\u0628\u0637 Web Audio",
      contextRunning: "\u0635\u062F\u0627 \u0641\u0639\u0627\u0644",
      contextSuspended: "\u0635\u062F\u0627 \u0645\u0639\u0644\u0642",
      contextNone: "\u0635\u062F\u0627 \u0647\u0646\u0648\u0632 \u0628\u0627\u0632 \u0646\u0634\u062F\u0647",
      outputLevel: "\u0628\u06CC\u0634\u06CC\u0646\u0647\u0654 \u0633\u0637\u062D \u062E\u0631\u0648\u062C\u06CC",
      signalProof: "\u0627\u06CC\u0646 \u0648\u0636\u0639\u06CC\u062A\u060C \u062E\u0631\u0648\u062C\u06CC \u0645\u062D\u0644\u06CC \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F. \u0628\u0631\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u060C \u0641\u0627\u06CC\u0644 \u0648\u0648\u06CC\u0633\u0650 \u0636\u0628\u0637\u200C\u0634\u062F\u0647 \u06CC\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A\u200C\u0634\u062F\u0647 \u0631\u0627 \u062F\u0631 \u0628\u062E\u0634 \u062E\u0648\u0627\u0646\u062F\u0646 \u067E\u06CC\u0627\u0645 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646.",
      local: "\u0628\u062F\u0648\u0646 \u0633\u0631\u0648\u0631 \xB7 \u067E\u0631\u062F\u0627\u0632\u0634 \u0631\u0648\u06CC \u062F\u0633\u062A\u06AF\u0627\u0647",
      target: "\u062A\u0628 \u0645\u0642\u0635\u062F",
      refresh: "\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062A\u0628 \u0645\u0642\u0635\u062F",
      send: "\u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645",
      receive: "\u062E\u0648\u0627\u0646\u062F\u0646 \u067E\u06CC\u0627\u0645",
      message: "\u06F1. \u0645\u062A\u0646 \u067E\u06CC\u0627\u0645",
      shortTip: "\u0645\u062A\u0646 \u06A9\u0648\u062A\u0627\u0647 \u0628\u0647\u062A\u0631 \u0645\u0646\u062A\u0642\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F",
      mode: "\u0631\u0648\u0634 \u0627\u0646\u062A\u0642\u0627\u0644",
      fast: "\u0648\u0627\u0636\u062D \u0648 \u0634\u0646\u06CC\u062F\u0627\u0631\u06CC \u2014 \u0628\u0631\u0627\u06CC \u0627\u0648\u0644\u06CC\u0646 \u062A\u0633\u062A",
      hidden: "\u0641\u0631\u06A9\u0627\u0646\u0633\u200C\u0628\u0627\u0644\u0627 \u2014 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0648 \u0622\u0633\u06CC\u0628\u200C\u067E\u0630\u06CC\u0631",
      fastHint: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u0634\u0646\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0628\u0631\u0627\u06CC \u062A\u0633\u062A \u0627\u0648\u0644\u06CC\u0647 \u0648 \u0628\u0631\u0631\u0633\u06CC \u062D\u0641\u0638 \u067E\u06CC\u0627\u0645 \u062F\u0631 \u0648\u0648\u06CC\u0633\u060C \u0627\u0632 \u0627\u06CC\u0646 \u062D\u0627\u0644\u062A \u0634\u0631\u0648\u0639 \u06A9\u0646.",
      hiddenHint: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u06A9\u0645\u200C\u0634\u0646\u0648\u0627\u062A\u0631 \u0627\u0633\u062A\u061B \u0641\u0634\u0631\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u0648\u0648\u06CC\u0633 \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0622\u0646 \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u062F. \u062D\u0641\u0638 \u0645\u062A\u0646 \u062A\u0636\u0645\u06CC\u0646 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
      strength: "\u0642\u062F\u0631\u062A \u0633\u06CC\u06AF\u0646\u0627\u0644",
      soft: "\u06A9\u0645",
      normal: "\u0645\u062A\u0639\u0627\u062F\u0644",
      strong: "\u0632\u06CC\u0627\u062F",
      password: "\u0631\u0645\u0632 \u0627\u062E\u062A\u06CC\u0627\u0631\u06CC",
      build: "\u0633\u0627\u062E\u062A \u0633\u06CC\u06AF\u0646\u0627\u0644",
      building: "\u062F\u0631 \u062D\u0627\u0644 \u0633\u0627\u062E\u062A\u2026",
      ready: "\u0633\u0627\u062E\u062A\u0647 \u0634\u062F",
      saveSignal: "\u062F\u0627\u0646\u0644\u0648\u062F \u0633\u06CC\u06AF\u0646\u0627\u0644 WAV",
      mergeTitle: "\u062A\u0631\u06A9\u06CC\u0628 \u0628\u0627 \u0636\u0628\u0637 \u0628\u0639\u062F\u06CC",
      mergeTip: "\u0631\u0648\u06CC \u0622\u06CC\u06A9\u0648\u0646 \u0627\u0641\u0632\u0648\u0646\u0647 \u062F\u0631 \u062A\u0628 \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u06A9\u0644\u06CC\u06A9 \u06A9\u0646\u060C \u0633\u067E\u0633 \u062A\u0631\u06A9\u06CC\u0628 \u0631\u0627 \u0641\u0639\u0627\u0644 \u06A9\u0646 \u0648 \u062F\u06A9\u0645\u0647\u0654 \u0636\u0628\u0637 \u0648\u0648\u06CC\u0633 \u0633\u0627\u06CC\u062A \u0631\u0627 \u0628\u0632\u0646.",
      arm: "\u0641\u0639\u0627\u0644 \u06A9\u0631\u062F\u0646 \u062A\u0631\u06A9\u06CC\u0628 \u0628\u0631\u0627\u06CC \u06CC\u06A9 \u0636\u0628\u0637",
      disarm: "\u0644\u063A\u0648 \u062A\u0631\u06A9\u06CC\u0628",
      idle: "\u062A\u0631\u06A9\u06CC\u0628 \u062E\u0627\u0645\u0648\u0634 \u0627\u0633\u062A",
      armed: "\u0641\u0639\u0627\u0644 \u0627\u0633\u062A\u061B \u0647\u0646\u0648\u0632 \u0645\u0633\u06CC\u0631 \u0636\u0628\u0637 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F\u0647 \xB7 \u0645\u0647\u0644\u062A \u06F2 \u062F\u0642\u06CC\u0642\u0647",
      waiting: "\u0648\u0631\u0648\u062F\u06CC \u062A\u0631\u06A9\u06CC\u0628\u06CC \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A\u061B \u0645\u0646\u062A\u0638\u0631 \u0634\u0631\u0648\u0639 \u0636\u0628\u0637 \u0633\u0627\u06CC\u062A",
      recording: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u062F\u0631 \u062D\u0627\u0644 \u0627\u0636\u0627\u0641\u0647 \u0634\u062F\u0646 \u0628\u0647 \u0648\u0648\u06CC\u0633\u2026",
      complete: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u062F\u0631 \u062E\u0631\u0648\u062C\u06CC \u06A9\u0627\u0645\u0644 \u0634\u062F\u061B \u0648\u0648\u06CC\u0633 \u0636\u0628\u0637\u200C\u0634\u062F\u0647 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646",
      incomplete: "\u0636\u0628\u0637 \u0642\u0628\u0644 \u0627\u0632 \u067E\u0627\u06CC\u0627\u0646 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0645\u062A\u0648\u0642\u0641 \u06CC\u0627 \u0645\u06A9\u062B \u0634\u062F",
      expired: "\u0645\u0647\u0644\u062A \u062A\u0645\u0627\u0645 \u0634\u062F\u061B \u062A\u0631\u06A9\u06CC\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0641\u0639\u0627\u0644 \u06A9\u0646",
      unsupported: "\u0627\u06CC\u0646 \u062A\u0628 \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u06CC\u0633\u062A",
      error: "\u062E\u0637\u0627\u06CC \u062A\u0631\u06A9\u06CC\u0628",
      hold: "\u0648\u0648\u06CC\u0633 \u0631\u0627 \u062D\u062F\u0627\u0642\u0644 {n} \u062B\u0627\u0646\u06CC\u0647 \u0636\u0628\u0637 \u06A9\u0646. \u0635\u062F\u0627 \u0641\u0642\u0637 \u06CC\u06A9 \u0628\u0627\u0631 \u0627\u0636\u0627\u0641\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
      compat: "\u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u0628\u06CC\u0634\u062A\u0631 \u0628\u0627 \u0627\u06CC\u0646 \u0633\u0627\u06CC\u062A",
      compatTip: "\u0627\u06AF\u0631 \u0633\u0627\u06CC\u062A \u0636\u0628\u0637 \u0631\u0627 \u0627\u0632 \u0642\u0628\u0644 \u0622\u0645\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u062F\u0633\u062A\u0631\u0633\u06CC \u0647\u0645\u06CC\u0646 \u0633\u0627\u06CC\u062A \u0631\u0627 \u0628\u062F\u0647 \u062A\u0627 \u0627\u0641\u0632\u0648\u0646\u0647 \u0642\u0628\u0644 \u0627\u0632 \u06A9\u062F \u0633\u0627\u06CC\u062A \u0622\u0645\u0627\u062F\u0647 \u0634\u0648\u062F. \u0633\u067E\u0633 \u062E\u0648\u062F\u062A \u062A\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0648 \u062A\u0631\u06A9\u06CC\u0628 \u0631\u0627 \u0641\u0639\u0627\u0644 \u06A9\u0646. \u0636\u0628\u0637 \u06CC\u0627 \u0627\u0631\u0633\u0627\u0644 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0627\u0646\u062C\u0627\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
      enableSite: "\u062F\u0627\u062F\u0646 \u062F\u0633\u062A\u0631\u0633\u06CC \u0641\u0642\u0637 \u0628\u0647 \u0647\u0645\u06CC\u0646 \u0633\u0627\u06CC\u062A",
      disableSite: "\u062D\u0630\u0641 \u062F\u0633\u062A\u0631\u0633\u06CC \u0647\u0645\u06CC\u0646 \u0633\u0627\u06CC\u062A",
      siteEnabled: "\u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u0632\u0648\u062F\u0647\u0646\u06AF\u0627\u0645 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A\u061B \u0628\u0639\u062F \u0627\u0632 \u0630\u062E\u06CC\u0631\u0647\u0654 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u062A\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646.",
      siteDisabled: "\u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0627\u0626\u0645\u06CC \u0627\u06CC\u0646 \u0633\u0627\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F. \u0628\u0631\u0627\u06CC \u0628\u0631\u062F\u0627\u0634\u062A\u0646 \u06A9\u062F\u0650 \u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC\u060C \u062A\u0628 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646.",
      readTitle: "\u0645\u062A\u0646 \u0631\u0627 \u0627\u0632 \u0648\u0648\u06CC\u0633 \u0628\u062E\u0648\u0627\u0646",
      readTip: "\u0648\u0648\u06CC\u0633 \u0627\u0635\u0644\u06CC \u0631\u0627 \u062F\u0627\u0646\u0644\u0648\u062F \u0648 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u061B \u06CC\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0632 \u0635\u062F\u0627\u06CC \u062A\u0628 \u0631\u0627 \u0634\u0631\u0648\u0639 \u06A9\u0646 \u0648 \u0628\u0639\u062F \u0648\u0648\u06CC\u0633 \u0631\u0627 \u062F\u0631 \u0633\u0627\u06CC\u062A \u067E\u062E\u0634 \u06A9\u0646.",
      file: "\u0627\u0646\u062A\u062E\u0627\u0628 \u0641\u0627\u06CC\u0644 \u0635\u0648\u062A\u06CC",
      decodePassword: "\u0631\u0645\u0632 \u067E\u06CC\u0627\u0645\u060C \u0627\u06AF\u0631 \u0631\u0645\u0632\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F\u0647",
      or: "\u06CC\u0627 \u0627\u0632 \u0648\u0648\u06CC\u0633\u0650 \u062F\u0631 \u062D\u0627\u0644 \u067E\u062E\u0634",
      captureTab: "\u0634\u0631\u0648\u0639 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0632 \u0635\u062F\u0627\u06CC \u062A\u0628",
      captureTip: "\u0641\u0642\u0637 \u0635\u062F\u0627\u06CC \u062A\u0628 \u0645\u0642\u0635\u062F \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0635\u062F\u0627\u06CC \u0633\u0627\u06CC\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0647\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u062D\u062F\u0627\u06A9\u062B\u0631 \u06F2 \u062F\u0642\u06CC\u0642\u0647.",
      stopCapture: "\u062A\u0648\u0642\u0641 \u0648 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0645\u062A\u0646",
      analyzing: "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC \u0635\u062F\u0627\u2026",
      cancel: "\u0644\u063A\u0648",
      found: "\u067E\u06CC\u0627\u0645 \u067E\u06CC\u062F\u0627 \u0634\u062F",
      copy: "\u06A9\u067E\u06CC \u0645\u062A\u0646",
      copied: "\u0645\u062A\u0646 \u06A9\u067E\u06CC \u0634\u062F",
      retry: "\u062A\u0644\u0627\u0634 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627 \u0631\u0645\u0632 \u0648\u0627\u0631\u062F\u0634\u062F\u0647",
      demo: "\u0622\u0632\u0645\u0627\u06CC\u0634 \u062F\u0627\u062E\u0644\u06CC \u0636\u0628\u0637 \u0648 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0645\u062A\u0646 \u2197",
      help: "\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0648 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A\u200C\u0647\u0627",
      help1: "\u0627\u0641\u0632\u0648\u0646\u0647 \u0631\u0627 \u0631\u0648\u06CC \u062A\u0628 \u0648\u0628 \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u0628\u0627\u0632 \u06A9\u0646 \u0648 \u0627\u062C\u0627\u0632\u0647\u0654 \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u0633\u0627\u06CC\u062A \u0631\u0627 \u0628\u062F\u0647.",
      help2: "\u0645\u062A\u0646 \u0631\u0627 \u0628\u0633\u0627\u0632\u060C \u062A\u0631\u06A9\u06CC\u0628 \u0631\u0627 \u0641\u0639\u0627\u0644 \u06A9\u0646 \u0648 \u0648\u0648\u06CC\u0633 \u0631\u0627 \u062A\u0627 \u067E\u0627\u06CC\u0627\u0646 \u0632\u0645\u0627\u0646 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0636\u0628\u0637 \u06A9\u0646.",
      help3: "\u06AF\u06CC\u0631\u0646\u062F\u0647 \u0647\u0645 \u0627\u06CC\u0646 \u0627\u0641\u0632\u0648\u0646\u0647 \u0631\u0627 \u0646\u0635\u0628 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0648\u0648\u06CC\u0633 \u0631\u0627 \u0628\u0627 \u0641\u0627\u06CC\u0644 \u06CC\u0627 \u0635\u062F\u0627\u06CC \u062A\u0628 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F.",
      help4: "\u0636\u0628\u0637 \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u0628\u0627 MediaRecorder \u0648 Web Audio \u067E\u0648\u0634\u0634 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u0647\u0631 \u0633\u0627\u06CC\u062A \u0648 \u062D\u0641\u0638 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u067E\u0633 \u0627\u0632 \u0627\u0631\u0633\u0627\u0644 \u0628\u0627\u06CC\u062F \u0628\u0627 \u0641\u0627\u06CC\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A\u200C\u0634\u062F\u0647 \u0628\u0631\u0631\u0633\u06CC \u0634\u0648\u062F.",
      privacy: "\u0645\u062A\u0646 \u0648 \u0631\u0645\u0632 \u0630\u062E\u06CC\u0631\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u067E\u0631\u062F\u0627\u0632\u0634 \u0622\u0641\u0644\u0627\u06CC\u0646 \u0627\u0633\u062A. \u0633\u0627\u06CC\u062A \u0645\u0642\u0635\u062F \u0628\u0647 \u0635\u062F\u0627\u06CC \u062A\u0631\u06A9\u06CC\u0628\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0627\u0631\u062F. \u0628\u0631\u0627\u06CC \u0645\u062D\u0631\u0645\u0627\u0646\u06AF\u06CC \u0645\u062A\u0646\u060C \u0631\u0645\u0632 \u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646 \u0648 \u0631\u0645\u0632 \u0631\u0627 \u062C\u062F\u0627 \u0628\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u0628\u062F\u0647.",
      noTarget: "\u0631\u0648\u06CC \u0622\u06CC\u06A9\u0648\u0646 \u0627\u0641\u0632\u0648\u0646\u0647 \u062F\u0631 \u062A\u0628 \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u06A9\u0644\u06CC\u06A9 \u06A9\u0646",
      seconds: "\u062B\u0627\u0646\u06CC\u0647",
      emptyMessage: "\u0627\u0648\u0644 \u0645\u062A\u0646 \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633.",
      messageTooLong: "\u067E\u06CC\u0627\u0645 \u0628\u06CC\u0634 \u0627\u0632 \u06F5\u06F0\u06F0 \u0646\u0648\u06CC\u0633\u0647 \u06CC\u0627 \u06F2\u06F0\u06F0\u06F0 \u0628\u0627\u06CC\u062A \u0627\u0633\u062A.",
      invalidPacket: "\u0633\u06CC\u06AF\u0646\u0627\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A\u061B \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0633\u0627\u0632.",
      noMessage: "\u067E\u06CC\u0627\u0645\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F. \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0636\u0628\u0637 \u06A9\u0648\u062A\u0627\u0647\u060C \u0642\u062F\u0631\u062A \u06A9\u0645 \u06CC\u0627 \u0641\u0634\u0631\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u0648\u0648\u06CC\u0633 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0631\u0627 \u062E\u0631\u0627\u0628 \u06A9\u0631\u062F\u0647 \u0628\u0627\u0634\u062F.",
      passwordNeeded: "\u067E\u06CC\u0627\u0645 \u0631\u0645\u0632 \u062F\u0627\u0631\u062F\u061B \u0631\u0645\u0632 \u0631\u0627 \u0648\u0627\u0631\u062F \u0648 \u062A\u0644\u0627\u0634 \u062F\u0648\u0628\u0627\u0631\u0647 \u0631\u0627 \u0628\u0632\u0646.",
      badPassword: "\u0631\u0645\u0632 \u062F\u0631\u0633\u062A \u0646\u06CC\u0633\u062A\u061B \u0631\u0645\u0632 \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0628\u062F\u0647 \u0648 \u062A\u0644\u0627\u0634 \u062F\u0648\u0628\u0627\u0631\u0647 \u0631\u0627 \u0628\u0632\u0646.",
      fileError: "\u0641\u0627\u06CC\u0644 \u0635\u0648\u062A\u06CC \u0642\u0627\u0628\u0644 \u062E\u0648\u0627\u0646\u062F\u0646 \u0646\u06CC\u0633\u062A.",
      fileTooLarge: "\u062D\u062F\u0627\u06A9\u062B\u0631 \u062D\u062C\u0645 \u0641\u0627\u06CC\u0644 \u06F2\u06F5 \u0645\u06AF\u0627\u0628\u0627\u06CC\u062A \u0627\u0633\u062A.",
      audioTooLong: "\u062D\u062F\u0627\u06A9\u062B\u0631 \u0637\u0648\u0644 \u0635\u0648\u062A \u06F2 \u062F\u0642\u06CC\u0642\u0647 \u0627\u0633\u062A.",
      sampleRateLow: "\u06A9\u06CC\u0641\u06CC\u062A \u0646\u0645\u0648\u0646\u0647\u200C\u0628\u0631\u062F\u0627\u0631\u06CC \u0627\u06CC\u0646 \u0641\u0627\u06CC\u0644 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A.",
      decodeTimeout: "\u0628\u0631\u0631\u0633\u06CC \u0635\u062F\u0627 \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0637\u0648\u0644 \u06A9\u0634\u06CC\u062F.",
      decodeError: "\u062E\u0637\u0627\u06CC \u062A\u062D\u0644\u06CC\u0644 \u0635\u062F\u0627\u061B \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646.",
      cryptoUnavailable: "\u0642\u0627\u0628\u0644\u06CC\u062A \u0631\u0645\u0632\u06AF\u0630\u0627\u0631\u06CC \u062F\u0631 \u0627\u06CC\u0646 \u0645\u062D\u06CC\u0637 \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A.",
      recordingBusy: "\u0636\u0628\u0637 \u0633\u0627\u06CC\u062A \u0647\u0646\u0648\u0632 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A. \u0627\u0628\u062A\u062F\u0627 \u0636\u0628\u0637 \u0633\u0627\u06CC\u062A \u0631\u0627 \u0645\u062A\u0648\u0642\u0641 \u06A9\u0646.",
      unsupportedTab: "\u0627\u06CC\u0646 \u0642\u0627\u0628\u0644\u06CC\u062A \u0631\u0648\u06CC \u062A\u0628 HTTPS \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u06CC\u0627 localhost \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0631\u0648\u06CC \u0622\u06CC\u06A9\u0648\u0646 \u0627\u0641\u0632\u0648\u0646\u0647 \u062F\u0631 \u0647\u0645\u0627\u0646 \u062A\u0628 \u06A9\u0644\u06CC\u06A9 \u06A9\u0646.",
      recorderUnsupported: "\u0648\u0631\u0648\u062F\u06CC \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u06CC\u0627 Web Audio \u062F\u0631 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A.",
      sitePermission: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0633\u0627\u06CC\u062A \u062F\u0627\u062F\u0647 \u0646\u0634\u062F.",
      captureError: "\u062F\u0631\u06CC\u0627\u0641\u062A \u0635\u062F\u0627\u06CC \u062A\u0628 \u0634\u0631\u0648\u0639 \u0646\u0634\u062F. \u0631\u0648\u06CC \u0622\u06CC\u06A9\u0648\u0646 \u0627\u0641\u0632\u0648\u0646\u0647 \u062F\u0631 \u062A\u0628 \u0645\u0642\u0635\u062F \u06A9\u0644\u06CC\u06A9 \u06A9\u0646 \u0648 \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0646.",
      unexpected: "\u0639\u0645\u0644\u06CC\u0627\u062A \u0627\u0646\u062C\u0627\u0645 \u0646\u0634\u062F. \u062A\u0628 \u0645\u0642\u0635\u062F \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0647\u0627 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646.",
      NotAllowedError: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0631\u062F \u0634\u062F\u061B \u0645\u062C\u0648\u0632 \u0633\u0627\u06CC\u062A \u06CC\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0635\u062F\u0627\u06CC \u062A\u0628 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646.",
      NotFoundError: "\u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F.",
      NotReadableError: "\u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u062F\u06CC\u06AF\u0631\u06CC \u0622\u0646 \u0631\u0627 \u06AF\u0631\u0641\u062A\u0647 \u0627\u0633\u062A.",
      labTitle: "\u0622\u0632\u0645\u0627\u06CC\u0634 \u0642\u0628\u0644 \u0627\u0632 \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646",
      labTip: "\u0645\u062A\u0646 \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u060C \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u0631\u0627 \u0627\u062C\u0627\u0632\u0647 \u0628\u062F\u0647 \u0648 \u06CC\u06A9 \u0648\u0648\u06CC\u0633 \u0636\u0628\u0637 \u06A9\u0646. \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0648\u0627\u0642\u0639\u0627\u064B \u0628\u0627 \u0648\u0631\u0648\u062F\u06CC \u0645\u06CC\u06A9\u0631\u0648\u0641\u0648\u0646 \u062A\u0631\u06A9\u06CC\u0628 \u0648 \u0628\u0647 WebM/Opus \u0636\u0628\u0637 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0633\u067E\u0633 \u0645\u062A\u0646 \u0627\u0632 \u0641\u0627\u06CC\u0644 \u0636\u0628\u0637\u200C\u0634\u062F\u0647 \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
      record: "\u0634\u0631\u0648\u0639 \u0636\u0628\u0637 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC",
      stop: "\u062A\u0648\u0642\u0641 \u0648 \u0628\u0631\u0631\u0633\u06CC \u0648\u0648\u06CC\u0633",
      labReady: "\u0622\u0645\u0627\u062F\u0647\u0654 \u0622\u0632\u0645\u0627\u06CC\u0634",
      labRecording: "\u062F\u0631 \u062D\u0627\u0644 \u0636\u0628\u0637\u061B \u062A\u0627 \u06A9\u0627\u0645\u0644\u200C\u0634\u062F\u0646 \u0633\u06CC\u06AF\u0646\u0627\u0644 \u0635\u0628\u0631 \u06A9\u0646",
      saveVoice: "\u062F\u0627\u0646\u0644\u0648\u062F \u0648\u0648\u06CC\u0633 \u062A\u0631\u06A9\u06CC\u0628\u06CC",
      labDone: "\u0645\u062A\u0646 \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC\u200C\u0634\u062F\u0647:",
      labLimit: "\u0627\u06CC\u0646 \u062A\u0633\u062A \u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u0628\u0627 \u06A9\u062F\u06A9 \u0636\u0628\u0637\u0650 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0641\u0634\u0631\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u0645\u062C\u062F\u062F \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u0628\u0627\u06CC\u062F \u062C\u062F\u0627 \u062A\u0633\u062A \u0634\u0648\u062F.",
      back: "\u0628\u0631\u06AF\u0634\u062A \u0628\u0647 \u0627\u0641\u0632\u0648\u0646\u0647: \u0631\u0648\u06CC \u0622\u06CC\u06A9\u0648\u0646 SonicQR \u062F\u0631 \u062A\u0628 \u067E\u06CC\u0627\u0645\u200C\u0631\u0633\u0627\u0646 \u06A9\u0644\u06CC\u06A9 \u06A9\u0646."
    },
    en: {
      step2: "2",
      mixPrivacy: "Text and audio are processed locally; the site receives the mixed voice. Use a password for private text.",
      privacyLink: "Privacy policy",
      tagline: "Short text inside your voice",
      blocked: "Browser audio is suspended; click the site page.",
      audioBlocked: "Audio could not start. Arm again, then click the actual site page and start recording.",
      reloadRequired: "The old hook is still loaded. Reload the site tab.",
      diagnostics: "Recording path details",
      copyDiagnostics: "Copy diagnostic report",
      diagnosticsCopied: "Report copied without message, password or audio.",
      pathNone: "No recording path detected",
      pathMicrophone: "Microphone input prepared",
      pathManual: "Manual start on mixed input",
      startSignal: "Site is recording \u2014 add signal now",
      manualTip: "If the site is recording but this status still says waiting, press this button and keep recording until the signal finishes.",
      recorderUnmixed: "The site started a recorder with an earlier input. Stop recording, enable compatibility access for this site and reload the tab.",
      noMixedStream: "No mixed input found. Enable site compatibility and reload the tab.",
      pathRecorder: "MediaRecorder recording",
      pathWebAudio: "Web Audio recording",
      contextRunning: "Audio running",
      contextSuspended: "Audio suspended",
      contextNone: "Audio not opened yet",
      outputLevel: "Peak output level",
      signalProof: "This status describes the local output. Verify the recorded or received voice file in Read message.",
      local: "No server \xB7 processed locally",
      target: "Target tab",
      refresh: "Refresh target tab",
      send: "Send message",
      receive: "Read message",
      message: "1. Your message",
      shortTip: "Short messages work best",
      mode: "Transmission mode",
      fast: "Audible \u2014 start here",
      hidden: "High frequency \u2014 experimental",
      fastHint: "You will hear the signal. Start here to test whether voice recordings preserve the message.",
      hiddenHint: "Less audible, but voice compression may remove it. Message recovery is not guaranteed.",
      strength: "Signal strength",
      soft: "Low",
      normal: "Balanced",
      strong: "High",
      password: "Optional password",
      build: "Create signal",
      building: "Creating\u2026",
      ready: "Signal ready",
      saveSignal: "Download signal WAV",
      mergeTitle: "Mix into the next recording",
      mergeTip: "Click this extension\u2019s icon on the messenger tab, arm mixing, then press the site\u2019s voice-record button.",
      arm: "Arm mixing for one recording",
      disarm: "Cancel mixing",
      idle: "Mixing is off",
      armed: "Armed; no recording path detected yet \xB7 2 min limit",
      waiting: "Mixed microphone ready; waiting for the site recorder",
      recording: "Adding the signal to your voice\u2026",
      complete: "Signal finished in the output; check the recorded voice",
      incomplete: "Recording stopped or paused before the signal finished",
      expired: "Arm timed out; arm again",
      unsupported: "This tab is not supported",
      error: "Mixing error",
      hold: "Record at least {n} seconds. The signal is added once.",
      compat: "Improve compatibility on this site",
      compatTip: "For sites that prepare their recorder early, allow this site so the hook loads before site code. Then reload the tab yourself and arm mixing. Nothing is recorded or sent automatically.",
      enableSite: "Allow only this site",
      disableSite: "Remove this site\u2019s permission",
      siteEnabled: "Early preparation enabled. Save any draft, reload the tab, then arm mixing.",
      siteDisabled: "Persistent access removed. Reload the tab to remove its existing hook.",
      readTitle: "Read text from a voice message",
      readTip: "Download and select the original voice file, or start tab capture and then play the voice message on the site.",
      file: "Choose an audio file",
      decodePassword: "Message password, if encrypted",
      or: "Or listen to the playing voice",
      captureTab: "Start listening to the tab",
      captureTip: "Captures audio from the target tab only, up to 2 minutes. Other apps are excluded.",
      stopCapture: "Stop and extract text",
      analyzing: "Analyzing audio\u2026",
      cancel: "Cancel",
      found: "Message found",
      copy: "Copy text",
      copied: "Text copied",
      retry: "Retry with this password",
      demo: "Test recording and decoding locally \u2197",
      help: "Quick guide and limits",
      help1: "Open this extension on the messenger\u2019s web tab and grant the site microphone access.",
      help2: "Create the signal, arm mixing, and record your voice until the signal finishes.",
      help3: "The recipient uses this extension to read the audio file or capture the playing tab.",
      help4: "Microphone recording through MediaRecorder and Web Audio is covered. Test each site and signal preservation using the received audio file.",
      privacy: "Text and passwords are not stored. Processing is local. The destination site can access the mixed audio. Use a password for private text and send the password separately.",
      noTarget: "Click the extension icon on your messenger tab",
      seconds: "seconds",
      emptyMessage: "Enter a message first.",
      messageTooLong: "Maximum: 500 characters and 2000 UTF-8 bytes.",
      invalidPacket: "Invalid signal. Create it again.",
      noMessage: "No message found. A short recording, weak signal, or voice compression may have damaged it.",
      passwordNeeded: "This message is encrypted. Enter the password and retry.",
      badPassword: "Incorrect password. Change it and retry.",
      fileError: "This audio file could not be read.",
      fileTooLarge: "Maximum file size is 25 MB.",
      audioTooLong: "Maximum audio duration is 2 minutes.",
      sampleRateLow: "This file\u2019s sample rate is too low.",
      decodeTimeout: "Audio analysis timed out.",
      decodeError: "Audio analysis failed. Try again.",
      cryptoUnavailable: "Encryption is unavailable in this context.",
      recordingBusy: "The site is still recording. Stop its recording first.",
      unsupportedTab: "Use a messenger HTTPS tab or localhost. Click the extension icon on that tab.",
      recorderUnsupported: "Microphone input or Web Audio is unavailable on this page.",
      sitePermission: "Site permission was not granted.",
      captureError: "Could not capture the tab. Click the extension icon on the target tab and retry.",
      unexpected: "Operation failed. Check the target tab and permissions.",
      NotAllowedError: "Permission denied. Check microphone or tab access.",
      NotFoundError: "No microphone found.",
      NotReadableError: "Microphone unavailable or in use.",
      labTitle: "Test before using a messenger",
      labTip: "Enter text, allow the microphone, and record your voice. The signal is mixed with your real microphone, recorded as WebM/Opus, and decoded from that recording.",
      record: "Start test recording",
      stop: "Stop and check voice",
      labReady: "Ready to test",
      labRecording: "Recording; wait for the signal to finish",
      saveVoice: "Download mixed voice",
      labDone: "Recovered text:",
      labLimit: "This test checks browser recording compression. A messenger\u2019s additional compression needs a separate test.",
      back: "Return to the extension by clicking SonicQR on the messenger tab."
    }
  };

  // src/demo.mjs
  var $ = (id) => document.getElementById(id);
  var decoder = new Decoder();
  var state = { lang: "fa", busy: false, recording: false, blob: null, audio: null, packet: null, result: "", error: "", phase: "labReady" };
  var recorder;
  var stream;
  var chunks = [];
  var interval;
  var timer;
  var startTime;
  var url;
  var tr = (key) => I18N[state.lang][key] || I18N[state.lang].unexpected;
  var number = (n) => new Intl.NumberFormat(state.lang === "fa" ? "fa-IR" : "en", { maximumFractionDigits: 1 }).format(n);
  function render() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => el.textContent = tr(el.dataset.i18n));
    $("language").textContent = state.lang === "fa" ? "EN" : "\u0641\u0627\u0631\u0633\u06CC";
    $("profileHint").textContent = tr($("profile").value === "hidden" ? "hiddenHint" : "fastHint");
    $("record").disabled = state.busy || state.recording;
    $("stop").hidden = !state.recording;
    $("clock").hidden = !state.recording;
    for (const id of ["message", "password", "profile"]) $(id).disabled = state.busy || state.recording;
    $("output").hidden = !state.blob;
    $("retry").disabled = state.busy || state.recording;
    $("error").hidden = !state.error;
    $("error").textContent = state.error ? tr(state.error) : "";
    $("result").hidden = !state.result;
    $("result").textContent = state.result ? tr("labDone") + "\n" + state.result : "";
    $("status").textContent = tr(state.phase);
  }
  function releaseMicrophone() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  async function analyze() {
    state.busy = true;
    state.error = "";
    state.result = "";
    state.phase = "analyzing";
    render();
    try {
      const result = await decoder.decode(state.audio, $("decodePassword").value, state.packet);
      state.result = result.text;
      state.packet = null;
      state.phase = "found";
    } catch (error) {
      if (error.packet) state.packet = error.packet;
      state.error = error.message;
      state.phase = "labReady";
    } finally {
      state.busy = false;
      render();
    }
  }
  async function recordingFinished() {
    clearInterval(interval);
    clearTimeout(timer);
    releaseMicrophone();
    state.recording = false;
    state.busy = true;
    $("progress").hidden = true;
    $("stop").disabled = false;
    state.blob = new Blob(chunks, { type: recorder.mimeType });
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(state.blob);
    $("preview").src = url;
    state.packet = null;
    $("decodePassword").value = $("password").value;
    render();
    try {
      state.audio = await readAudio(state.blob);
      await analyze();
    } catch (error) {
      state.error = error.message;
      state.phase = "labReady";
    } finally {
      state.busy = false;
      render();
    }
  }
  $("record").onclick = async () => {
    state.busy = true;
    state.error = "";
    state.result = "";
    state.blob = null;
    state.audio = null;
    state.packet = null;
    render();
    try {
      const api = globalThis.__sonicQRMixerV2__;
      if (!api) throw new Error("recorderUnsupported");
      api.prepare();
      $("preview").pause();
      const profile = $("profile").value;
      const packet = await makePacket($("message").value, $("password").value, PROFILES[profile].id);
      const armed = api.arm({ packet: Array.from(packet), profile, amplitude: profile === "hidden" ? 0.07 : 0.32 });
      $("minimum").textContent = tr("hold").replace("{n}", number(armed.duration + 1));
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      const mime = ["audio/webm;codecs=opus", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 128e3 } : {});
      chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => void recordingFinished();
      recorder.onerror = () => {
        state.error = "unexpected";
        if (recorder.state !== "inactive") recorder.stop();
        releaseMicrophone();
        render();
      };
      recorder.start();
      state.recording = true;
      state.phase = "labRecording";
      startTime = performance.now();
      $("clock").textContent = "00:00";
      $("progress").hidden = false;
      interval = setInterval(() => {
        const status = api.status();
        state.phase = status.phase;
        if (status.detail) state.error = status.detail;
        $("progress").value = Math.min(1, status.elapsed / status.duration);
        const elapsed = (performance.now() - startTime) / 1e3;
        $("clock").textContent = `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}`;
        render();
      }, 150);
      timer = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 119e3);
    } catch (error) {
      state.error = error.code || error.message || error.name;
      if (!I18N.fa[state.error]) state.error = error.name;
      releaseMicrophone();
      globalThis.__sonicQRMixerV2__?.disarm();
    } finally {
      state.busy = false;
      render();
    }
  };
  $("stop").onclick = () => {
    if (recorder?.state !== "inactive") {
      $("stop").disabled = true;
      recorder.stop();
    }
  };
  $("download").onclick = () => {
    if (state.blob) download(state.blob, "sonicqr-mixed-voice.webm");
  };
  $("retry").onclick = () => void analyze();
  $("profile").onchange = render;
  $("language").onclick = () => {
    state.lang = state.lang === "fa" ? "en" : "fa";
    render();
  };
  addEventListener("pagehide", () => {
    clearInterval(interval);
    clearTimeout(timer);
    releaseMicrophone();
    globalThis.__sonicQRMixerV2__?.disarm();
    decoder.cancel();
  });
  render();
})();
