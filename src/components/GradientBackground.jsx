import { useEffect, useRef } from 'react';

/*
 * Site-wide animated "noise gradient" background.
 * A fixed full-screen WebGL canvas behind everything: soft colour blobs that
 * drift slowly, a lighter glow rising from the bottom, and fine film grain.
 * Renders at reduced resolution (it is blurry by design) and pauses when the
 * tab is hidden. Reduced-motion users get a single still frame.
 */
const PALETTES = {
  // soft, light: keeps dark text readable on every section
  soft: {
    base: [0.941, 0.933, 0.902],  // #F0EEE6 cream
    a: [0.78, 0.85, 1.0],         // pale blue
    b: [0.90, 0.84, 1.0],         // lilac
    c: [1.0, 0.86, 0.80],         // peach
    glow: [0.72, 0.80, 1.0],      // bottom glow
    strength: 0.95
  },
  // ---- more soft palettes (same cream base, different clouds) ----
  ocean: { base: [0.941,0.933,0.902], a: [0.70,0.82,1.0], b: [0.66,0.90,0.98], c: [0.80,0.86,1.0], glow: [0.62,0.74,1.0], strength: 0.95 },
  mint: { base: [0.941,0.933,0.902], a: [0.74,0.94,0.88], b: [0.78,0.88,1.0], c: [0.90,0.97,0.82], glow: [0.70,0.92,0.90], strength: 0.95 },
  sunset: { base: [0.941,0.933,0.902], a: [1.0,0.82,0.72], b: [1.0,0.78,0.86], c: [1.0,0.90,0.70], glow: [1.0,0.76,0.70], strength: 0.95 },
  aurora: { base: [0.941,0.933,0.902], a: [0.72,0.94,0.86], b: [0.86,0.80,1.0], c: [0.70,0.84,1.0], glow: [0.80,0.78,1.0], strength: 0.95 },
  rose: { base: [0.941,0.933,0.902], a: [1.0,0.80,0.86], b: [0.92,0.82,1.0], c: [1.0,0.88,0.82], glow: [1.0,0.78,0.88], strength: 0.95 },
  // vivid, like the reference video
  vivid: {
    base: [0.80, 0.55, 0.95],
    a: [0.35, 0.65, 0.98],
    b: [0.72, 0.38, 0.97],
    c: [0.98, 0.52, 0.78],
    glow: [0.93, 0.74, 0.97],
    strength: 1.0
  }
};

// each section tints the background differently; the colours glide between them as you scroll
const SECTION_PAL = { top: 'aurora', about: 'mint', experience: 'ocean', work: 'aurora', stack: 'sunset', credentials: 'mint', thoughts: 'rose', contact: 'ocean' };
const SECTION_IDS = Object.keys(SECTION_PAL);

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes; uniform float uT;
uniform vec3 uBase, uA, uB, uC, uGlow; uniform float uStr;
// soft round falloff (smoothstep twice = no visible edge)
float blob(vec2 uv, vec2 c, float r){ float d = smoothstep(r, 0., distance(uv, c)); return d*d*(3.-2.*d); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 q = vec2(uv.x*asp, uv.y);
  float t = uT * 0.05;
  // gentle sine warp: silky, no grid artifacts
  q += 0.06 * vec2(sin(q.y*2.1 + t*1.7), cos(q.x*1.8 - t*1.3));
  vec3 col = uBase;
  col = mix(col, uA, blob(q, vec2(.25*asp + .25*sin(t*1.9), .70 + .15*cos(t*1.4)), .85) * uStr);
  col = mix(col, uB, blob(q, vec2(.80*asp + .20*cos(t*1.6), .60 + .20*sin(t*2.0)), .90) * uStr);
  col = mix(col, uC, blob(q, vec2(.55*asp + .30*sin(t*1.3+2.), .15 + .12*cos(t*2.2)), .80) * uStr * .85);
  float g = blob(vec2(uv.x*asp, uv.y), vec2(.5*asp + .08*sin(t*2.4), -.05), .75 + .05*sin(t*3.));
  col = mix(col, uGlow, g * .7);
  // invisible static dither so the gradient never bands
  float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - .5;
  col += d / 255.;
  gl_FragColor = vec4(col, 1.);
}`;

export default function GradientBackground({ palette = 'aurora' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return; // CSS fallback colour stays
    const pal = PALETTES[palette] || PALETTES.soft;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const cur = { a: [...pal.a], b: [...pal.b], c: [...pal.c], glow: [...pal.glow] };
    let target = pal;
    const push = () => {
      gl.uniform3fv(U('uBase'), pal.base); gl.uniform3fv(U('uA'), cur.a);
      gl.uniform3fv(U('uB'), cur.b); gl.uniform3fv(U('uC'), cur.c);
      gl.uniform3fv(U('uGlow'), cur.glow); gl.uniform1f(U('uStr'), pal.strength);
    };
    push();
    const pick = () => {
      let id = 'top';
      for (const k of SECTION_IDS) {
        const el = document.getElementById(k);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) id = k;
      }
      target = PALETTES[SECTION_PAL[id]] || pal;
      if (reduce) { ['a', 'b', 'c', 'glow'].forEach((k) => { cur[k] = [...target[k]]; }); push(); }
    };
    window.addEventListener('scroll', pick, { passive: true });
    pick();

    const size = () => {
      const scale = 0.6; // soft by design, so a lower resolution is plenty
      canvas.width = Math.max(2, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(2, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U('uRes'), canvas.width, canvas.height);
    };
    size();
    window.addEventListener('resize', size);

    let raf = 0, t0 = performance.now(), running = true;
    const draw = (now) => {
      if (!reduce) {
        ['a', 'b', 'c', 'glow'].forEach((k) => { for (let i = 0; i < 3; i++) cur[k][i] += (target[k][i] - cur[k][i]) * 0.035; });
        push();
      }
      gl.uniform1f(U('uT'), reduce ? 8 : (now - t0) / 1000 + 8);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onVis = () => {
      running = !document.hidden;
      if (running && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('scroll', pick);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [palette]);

  return <canvas className="gradient-bg" ref={ref} aria-hidden="true" />;
}
