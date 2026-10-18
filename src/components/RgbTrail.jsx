import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/*
 * RGB string mouse trail: a thin rainbow string that floats behind the cursor.
 * Own canvas implementation, no libraries. Only on devices with a real mouse.
 *
 * Tweak the look here:
 */
const POINTS = 34;       // number of joints in the string (more = longer)
const SEGMENT = 6.5;     // px between joints when stretched (length = POINTS x SEGMENT)
const HEAD_SPEED = 0.2;  // how quickly the string's head chases the mouse (lower = floatier)
const SETTLE = 0.07;     // how quickly the string shrinks back when the mouse stops
const WIDTH = 3.2;       // thickness at the head, in px (the tail is thinner)
const GLOW = 9;          // glow blur, in px (0 = none)
const SPREAD = 9;        // rainbow change per joint (bigger = more colours along the string)
const FLOW = 0.7;        // how quickly the rainbow slides along the string
const SAT = 88;          // colour saturation %
const LIGHT = 64;        // colour lightness %

export default function RgbTrail() {
  const reduce = useReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduce) return;
    // only for real mice: skip touch screens and pens
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -999, y: -999, seen: false };
    const pts = Array.from({ length: POINTS }, () => ({ x: -999, y: -999 }));
    let hue = 0;
    let raf = 0;
    let idleFrames = 0;

    const onMove = (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!mouse.seen) { // first move: start the whole string at the cursor
        mouse.seen = true;
        for (const p of pts) { p.x = e.clientX; p.y = e.clientY; }
      }
      idleFrames = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => { mouse.seen = false; };

    const frame = () => {
      raf = 0;
      // head chases the mouse
      pts[0].x += (mouse.x - pts[0].x) * HEAD_SPEED;
      pts[0].y += (mouse.y - pts[0].y) * HEAD_SPEED;
      let moving = Math.hypot(mouse.x - pts[0].x, mouse.y - pts[0].y) > 0.4;
      // every joint is pulled toward the one before it, but never stretches past SEGMENT
      for (let i = 1; i < POINTS; i++) {
        const a = pts[i - 1], b = pts[i];
        b.x += (a.x - b.x) * SETTLE;
        b.y += (a.y - b.y) * SETTLE;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d > SEGMENT) { b.x = a.x + (dx / d) * SEGMENT; b.y = a.y + (dy / d) * SEGMENT; }
        if (d > 0.5) moving = true;
      }
      hue = (hue + FLOW) % 360;
      draw();
      idleFrames = moving ? 0 : idleFrames + 1;
      if (idleFrames < 6) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!mouse.seen) return;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // from the tail up to the head, so the head sits on top
      for (let i = POINTS - 2; i >= 0; i--) {
        const p0 = pts[i], p1 = pts[i + 1];
        const pPrev = pts[i + 2] || p1;
        const m0x = (p1.x + pPrev.x) / 2, m0y = (p1.y + pPrev.y) / 2;
        const m1x = (p0.x + p1.x) / 2, m1y = (p0.y + p1.y) / 2;
        const t = 1 - i / (POINTS - 1); // 0 at the head, 1 at the tail
        const color = `hsl(${(hue + i * SPREAD) % 360} ${SAT}% ${LIGHT}%)`;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = GLOW;
        ctx.lineWidth = WIDTH * (0.35 + 0.65 * (1 - t));
        ctx.beginPath();
        ctx.moveTo(m0x, m0y);
        ctx.quadraticCurveTo(p1.x, p1.y, m1x, m1y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, W, H); }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce]);

  return <canvas className="rgb-trail" ref={canvasRef} aria-hidden="true" />;
}
