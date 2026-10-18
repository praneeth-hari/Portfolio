import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/*
 * Paint reveal: a base photo with a second image hidden underneath.
 * Drag (mouse) or double-tap then drag (touch) to paint a rough brush that
 * reveals the second image. Each stroke fades away after a few seconds.
 * Own canvas implementation, no external libraries.
 */
const HOLD = 1500;      // ms a dab stays fully visible
const FADE = 1900;      // ms it then takes to fade out
const LIFE = HOLD + FADE;
const BRUSH = 0.085;    // brush radius as a fraction of the canvas width
const MAX_DABS = 700;

// A rough, hand-painted looking stamp (irregular edge, soft shadow).
function makeStamps(size) {
  const stamps = [];
  for (let s = 0; s < 4; s++) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const r = size * 0.36;
    const n = 26;
    g.shadowColor = '#fff';
    g.shadowBlur = size * 0.07;
    g.fillStyle = '#fff';
    g.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.8 + Math.random() * 0.34);
      const x = size / 2 + Math.cos(a) * rr;
      const y = size / 2 + Math.sin(a) * rr;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
    g.fill();
    stamps.push(c);
  }
  return stamps;
}

export default function PaintReveal({ base, reveal, alt = '' }) {
  const reduce = useReducedMotion();
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const baseCvRef = useRef(null);
  const ringRef = useRef(null);
  const [painted, setPainted] = useState(false);
  const [baseReady, setBaseReady] = useState(false);
  const [armed, setArmed] = useState(false); // touch mode switched on

  useEffect(() => {
    if (reduce) return;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const baseCv = baseCvRef.current;
    const ring = ringRef.current;
    if (!box || !canvas || !baseCv) return;
    const ctx = canvas.getContext('2d');
    const bctx = baseCv.getContext('2d');
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');
    const stamps = makeStamps(128);
    const img = new Image();
    let imgReady = false;
    img.onload = () => { imgReady = true; };
    img.src = reveal;
    // The base photo is drawn on its own canvas so the brush can ERASE it where it paints.
    // Otherwise the real photo's hair and shoulders stay visible around the revealed helmet.
    const baseImg = new Image();
    let baseReady = false;
    baseImg.onload = () => {
      baseReady = true;
      setBaseReady(true);
      drawBase(false);
    };
    baseImg.src = base;
    const drawBase = (erase) => {
      if (!baseReady) return;
      bctx.globalCompositeOperation = 'source-over';
      bctx.clearRect(0, 0, W, H);
      bctx.drawImage(baseImg, 0, 0, W, H);
      if (erase) {
        bctx.globalCompositeOperation = 'destination-out';
        bctx.drawImage(mask, 0, 0);
        bctx.globalCompositeOperation = 'source-over';
      }
    };

    let W = 0, H = 0;
    let dabs = [];
    let raf = 0;
    let last = null;      // last painted point
    let down = false;
    let touchArmed = false;
    let armTimer = 0;
    let lastTap = { t: 0, x: 0, y: 0 };
    let everPainted = false;

    const size = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = mask.width = baseCv.width = W;
      canvas.height = mask.height = baseCv.height = H;
      drawBase(false);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(box);

    const frame = (now) => {
      raf = 0;
      dabs = dabs.filter((d) => now - d.t < LIFE);
      mctx.clearRect(0, 0, W, H);
      const R = BRUSH * W;
      for (const d of dabs) {
        const age = now - d.t;
        const a = age < HOLD ? 1 : 1 - (age - HOLD) / FADE;
        mctx.globalAlpha = a * a * (3 - 2 * a); // smoothstep
        const s = R * 2 * d.k;
        mctx.save();
        mctx.translate(d.x, d.y);
        mctx.rotate(d.rot);
        mctx.drawImage(stamps[d.s], -s / 2, -s / 2, s, s);
        mctx.restore();
      }
      mctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      if (dabs.length && imgReady) {
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(img, 0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }
      drawBase(dabs.length > 0 && imgReady);
      if (dabs.length) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const toLocal = (e) => {
      const r = box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, scale: W / r.width };
    };

    const stamp = (x, y, scale) => {
      dabs.push({
        x: x * scale, y: y * scale, t: performance.now(),
        s: (Math.random() * stamps.length) | 0,
        rot: Math.random() * Math.PI * 2,
        k: 0.85 + Math.random() * 0.4
      });
      if (dabs.length > MAX_DABS) dabs.shift();
      if (!everPainted) { everPainted = true; setPainted(true); }
    };

    const paintTo = (p) => {
      const step = BRUSH * p.w * 0.45;
      if (!last) { stamp(p.x, p.y, p.scale); last = p; return; }
      const dx = p.x - last.x, dy = p.y - last.y;
      const dist = Math.hypot(dx, dy);
      const n = Math.max(1, Math.floor(dist / step));
      for (let i = 1; i <= n; i++) stamp(last.x + (dx * i) / n, last.y + (dy * i) / n, p.scale);
      last = p;
      kick();
    };

    const moveRing = (p, show) => {
      if (!ring) return;
      const d = BRUSH * p.w * 2;
      ring.style.width = ring.style.height = d + 'px';
      ring.style.transform = `translate(${p.x - d / 2}px, ${p.y - d / 2}px)`;
      ring.style.opacity = show ? '1' : '0';
    };

    const disarm = () => { touchArmed = false; setArmed(false); };
    const arm = () => {
      touchArmed = true; setArmed(true);
      clearTimeout(armTimer);
      armTimer = setTimeout(disarm, 6000);
    };

    const onDown = (e) => {
      const p = toLocal(e);
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        if (e.button !== 0) return;
        e.preventDefault(); // no text selection while painting
        down = true; last = null;
        canvas.setPointerCapture?.(e.pointerId);
        paintTo(p); moveRing(p, true);
        return;
      }
      // touch: needs a double-tap first so normal scrolling still works
      const now = performance.now();
      const isDouble = now - lastTap.t < 350 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40;
      lastTap = { t: now, x: p.x, y: p.y };
      if (isDouble && !touchArmed) arm();
      if (touchArmed) {
        down = true; last = null;
        clearTimeout(armTimer);
        paintTo(p); moveRing(p, true);
      }
    };
    const onMove = (e) => {
      const p = toLocal(e);
      if (e.pointerType === 'touch') {
        if (down && touchArmed) { paintTo(p); moveRing(p, true); }
        return;
      }
      moveRing(p, true);
      if (down) paintTo(p);
    };
    const onUp = (e) => {
      down = false; last = null;
      if (e.pointerType === 'touch') {
        if (touchArmed) { clearTimeout(armTimer); armTimer = setTimeout(disarm, 4000); }
        if (ring) ring.style.opacity = '0';
      }
    };
    const onLeave = () => { if (ring) ring.style.opacity = '0'; };
    // once armed, a drag on the portrait must paint instead of scroll
    const onTouchMove = (e) => { if (touchArmed && e.cancelable) e.preventDefault(); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(armTimer);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [reduce, reveal, base]);

  return (
    <div className={'paint' + (armed ? ' is-armed' : '') + (painted ? ' is-painted' : '') + (baseReady ? ' base-ready' : '')} ref={boxRef}>
      <img className="paint-base" src={base} alt={alt} draggable="false" loading="eager" decoding="async" fetchPriority="high" />
      {!reduce && (
        <>
          <canvas className="paint-basecv" ref={baseCvRef} aria-hidden="true" />
          <canvas className="paint-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="paint-ring" ref={ringRef} aria-hidden="true" />
          <div className="paint-hint mono" aria-hidden="true">
            <span className="hint-fine">Drag to reveal</span>
            <span className="hint-touch">{armed ? 'Drag to paint' : 'Double-tap, then drag'}</span>
          </div>
        </>
      )}
    </div>
  );
}
