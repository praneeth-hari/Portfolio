import { useEffect, useRef } from 'react';

/*
 * "AI / ENGINEER" hero text with the WebGL fluid distortion effect.
 * Ported from the original single-file site: same shaders and behaviour,
 * wrapped in a React effect with proper cleanup. The real DOM text stays
 * as the fallback / accessible layer (reduced motion, no WebGL).
 */
export default function FluidText() {
  const stageRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!stage || !textEl || !canvas) return;
    let disposed = false;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static text stays

        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
          canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) return; // no WebGL -> static text stays (SSR / old browser fallback)

        // Canvas 2D images are top-left origin; WebGL textures are bottom-left origin.
        // Without this, the uploaded text texture renders upside-down relative to
        // the (correctly GL-oriented) mouse UV, making the whole effect feel reversed.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        /* ---- effect controls (spec: radius, strength, hue shift, trail persistence) ---- */
        const CFG = {
          radius: 0.22,
          strength: 5.5,
          hueShift: 0.0,
          trailPersistence: 0.965, // decay factor per frame while actively interacting
          releaseDecay: 0.90,      // faster decay once the pointer leaves, so it fully resets
          displace: 0.09,
          colors: [ // single-accent monochrome blend (no violet/orange per locked palette)
            [0x0e / 255, 0x2a / 255, 0x4d / 255], // deep navy
            [0x2F / 255, 0x5C / 255, 0xFF / 255], // accent blue
            [0x5B / 255, 0x8C / 255, 0xFF / 255], // bright blue
            [0xC9 / 255, 0xD6 / 255, 0xFF / 255]  // pale ice blue
          ]
        };

        /* ---------------- shaders ---------------- */
        const VERT = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }
    `;

        const NOISE = `
      vec3 mod289(vec3 x){return x-floor(x/289.0)*289.0;}
      vec2 mod289(vec2 x){return x-floor(x/289.0)*289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0*fract(p*C.www)-1.0;
        vec3 h = abs(x)-0.5;
        vec3 ox = floor(x+0.5);
        vec3 a0 = x-ox;
        m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
        vec3 g;
        g.x = a0.x*x0.x + h.x*x0.y;
        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
        return 130.0*dot(m,g);
      }
      vec2 curl(vec2 p){
        float e = 0.06;
        float n1 = snoise(p+vec2(0.0,e));
        float n2 = snoise(p-vec2(0.0,e));
        float n3 = snoise(p+vec2(e,0.0));
        float n4 = snoise(p-vec2(e,0.0));
        float dx = (n1-n2)/(2.0*e);
        float dy = (n3-n4)/(2.0*e);
        return vec2(dy,-dx);
      }
    `;

        // simulation: advects + decays a velocity/trail buffer, packed to 0..1
        const SIM_FRAG = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPrev;
      uniform vec2 uMouse, uMouseVel, uClickPos;
      uniform float uMouseActive, uClickTime, uHasClick, uTime;
      uniform float uRadius, uStrength, uDecay, uAspect;
      ${NOISE}
      void main(){
        vec2 uv = vUv;
        vec4 prevRaw = texture2D(uPrev, uv);
        vec2 prevVel = prevRaw.xy*2.0-1.0;
        vec2 c = curl(uv*3.2 + uTime*0.12) * 0.0016;
        vec2 advUv = clamp(uv + prevVel*0.0016 + c, 0.0, 1.0);
        vec4 adv = texture2D(uPrev, advUv);
        vec2 vel = (adv.xy*2.0-1.0) * uDecay;
        float trail = adv.z * uDecay;

        vec2 d = uv - uMouse; d.x *= uAspect;
        float dist = length(d);
        float falloff = smoothstep(uRadius, 0.0, dist);
        vel += uMouseVel * falloff * uStrength * uMouseActive;
        trail += falloff * uMouseActive * 0.55;

        vec2 cd = uv - uClickPos; cd.x *= uAspect;
        float cdist = length(cd);
        float ringR = uClickTime * 1.05;
        float ring = exp(-pow((cdist-ringR)*13.0, 2.0)) * exp(-uClickTime*2.0) * uHasClick;
        vec2 dir = cdist > 0.0001 ? cd/cdist : vec2(0.0);
        dir.x /= max(uAspect, 0.0001);
        vel += dir * ring * 2.2;
        trail += ring * 0.9;

        trail = clamp(trail, 0.0, 1.0);
        gl_FragColor = vec4(clamp(vel,-1.0,1.0)*0.5+0.5, trail, 1.0);
      }
    `;

        const RENDER_FRAG = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uText, uTrail;
      uniform vec3 uColor1, uColor2, uColor3, uColor4;
      uniform float uHueShift, uDisplace;
      vec3 hueShift(vec3 col, float shift){
        const vec3 k = vec3(0.57735,0.57735,0.57735);
        float c = cos(shift); float s = sin(shift);
        return col*c + cross(k,col)*s + k*dot(k,col)*(1.0-c);
      }
      void main(){
        vec4 trailRaw = texture2D(uTrail, vUv);
        vec2 vel = trailRaw.xy*2.0-1.0;
        float amt = clamp(trailRaw.z, 0.0, 1.0);
        vec2 uv = vUv + vel*uDisplace*amt;
        vec4 tex = texture2D(uText, uv);

        float angle = atan(vel.y, vel.x) * 0.15915494 + 0.5;
        vec3 gA = mix(uColor1, uColor2, smoothstep(0.0,0.5,angle));
        vec3 gB = mix(uColor3, uColor4, smoothstep(0.5,1.0,angle));
        vec3 grad = mix(gA, gB, step(0.5, angle));
        grad = hueShift(grad, uHueShift);

        vec3 tinted = mix(tex.rgb, grad, amt*0.92);
        gl_FragColor = vec4(tinted, tex.a);
      }
    `;

        function compile(type, src) {
          const sh = gl.createShader(type);
          gl.shaderSource(sh, src); gl.compileShader(sh);
          if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); return null; }
          return sh;
        }
        function program(vs, fs) {
          const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
          if (!v || !f) return null;
          const p = gl.createProgram();
          gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
          if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
          return p;
        }

        const simProg = program(VERT, SIM_FRAG);
        const renderProg = program(VERT, RENDER_FRAG);
        if (!simProg || !renderProg) return;

        function cacheUniforms(prog, names) {
          const out = {};
          names.forEach(n => { out[n] = gl.getUniformLocation(prog, n); });
          return out;
        }
        const simU = cacheUniforms(simProg, ['uPrev', 'uMouse', 'uMouseVel', 'uMouseActive', 'uClickPos', 'uClickTime', 'uHasClick', 'uTime', 'uRadius', 'uStrength', 'uDecay', 'uAspect']);
        const renderU = cacheUniforms(renderProg, ['uText', 'uTrail', 'uColor1', 'uColor2', 'uColor3', 'uColor4', 'uHueShift', 'uDisplace']);

        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        function bindQuad(prog) {
          const loc = gl.getAttribLocation(prog, 'aPos');
          gl.bindBuffer(gl.ARRAY_BUFFER, quad);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        }

        /* ---------------- sim FBOs (ping-pong, low-res for perf) ---------------- */
        const SIM_W = 200, SIM_H = 100;
        function makeFbo(w, h) {
          const tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          const fbo = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          return { tex, fbo };
        }
        let fboA = makeFbo(SIM_W, SIM_H), fboB = makeFbo(SIM_W, SIM_H);

        function clearFbo(f) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
          gl.viewport(0, 0, SIM_W, SIM_H);
          gl.clearColor(0.5, 0.5, 0, 1); // packed zero-velocity, zero trail
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        clearFbo(fboA); clearFbo(fboB);

        /* ---------------- text texture (rendered from live DOM styling) ---------------- */
        const textTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const off = document.createElement('canvas');
        const octx = off.getContext('2d');
        let stageW = 0, stageH = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

        function drawTextTexture() {
          stageW = stage.clientWidth; stageH = stage.clientHeight;
          if (stageW < 2 || stageH < 2) return false;
          off.width = Math.round(stageW * dpr);
          off.height = Math.round(stageH * dpr);
          canvas.width = off.width; canvas.height = off.height;
          canvas.style.width = stageW + 'px'; canvas.style.height = stageH + 'px';

          const cs = getComputedStyle(textEl);
          const fontSize = parseFloat(cs.fontSize);
          const lineHeight = fontSize * 0.92; // matches .role h2{line-height:.92}
          const font = `900 ${fontSize * dpr}px Archivo, sans-serif`;

          octx.setTransform(1, 0, 0, 1, 0, 0);
          octx.clearRect(0, 0, off.width, off.height);
          octx.font = font;
          octx.textBaseline = 'alphabetic';
          octx.textAlign = 'left';

          const ink = '#121210';
          // one line: solid "AI" + outlined "ENGINEER", centred as a pair
          const measure = () => ({
            wAI: octx.measureText('AI').width,
            wGap: octx.measureText(' ').width * 0.9,
            wEN: octx.measureText('ENGINEER').width
          });
          let { wAI, wGap, wEN } = measure();
          // shrink to fit if the real font renders wider than the screen allows
          let fs = fontSize * dpr;
          const maxW = off.width * 0.94;
          const total0 = wAI + wGap + wEN;
          if (total0 > maxW) {
            fs = fs * (maxW / total0);
            octx.font = `900 ${fs}px Archivo, sans-serif`;
            ({ wAI, wGap, wEN } = measure());
          }
          const x0 = (off.width - (wAI + wGap + wEN)) / 2;
          const m = octx.measureText('AI');
          const ascent = m.actualBoundingBoxAscent || fs * 0.78;

          octx.fillStyle = ink;
          octx.fillText('AI', x0, ascent);
          octx.strokeStyle = ink;
          octx.lineWidth = 2 * dpr;
          octx.strokeText('ENGINEER', x0 + wAI + wGap, ascent);

          gl.bindTexture(gl.TEXTURE_2D, textTex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
          return true;
        }

        /* ---------------- interaction state ---------------- */
        const mouse = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, active: 0 };
        let clickPos = [0.5, 0.5], clickTime = 999, hasClick = 0;
        let lastMoveT = performance.now();
        let running = false, visible = false, rafId = null;
        const IDLE_MS = 1400;

        function toUv(clientX, clientY) {
          const r = canvas.getBoundingClientRect();
          return [(clientX - r.left) / r.width, 1.0 - (clientY - r.top) / r.height];
        }

        function onMove(e) {
          const [x, y] = toUv(e.clientX, e.clientY);
          mouse.px = mouse.x; mouse.py = mouse.y;
          mouse.x = x; mouse.y = y;
          mouse.vx = x - mouse.px; mouse.vy = y - mouse.py;
          mouse.active = 1;
          lastMoveT = performance.now();
          ensureRunning();
        }
        function onLeave() { mouse.active = 0; mouse.vx = 0; mouse.vy = 0; }
        function onClick(e) {
          const [x, y] = toUv(e.clientX, e.clientY);
          clickPos = [x, y]; clickTime = 0; hasClick = 1;
          lastMoveT = performance.now();
          ensureRunning();
        }
        canvas.addEventListener('pointermove', onMove, { passive: true });
        canvas.addEventListener('pointerenter', onMove, { passive: true });
        canvas.addEventListener('pointerleave', onLeave, { passive: true });
        canvas.addEventListener('pointercancel', onLeave, { passive: true });
        canvas.addEventListener('mouseleave', onLeave, { passive: true });
        canvas.addEventListener('pointerdown', onClick, { passive: true });

        const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
          entries.forEach(en => {
            visible = en.isIntersecting;
            if (visible) ensureRunning();
            else if (running) { running = false; if (rafId) cancelAnimationFrame(rafId); }
          });
        }, { threshold: 0.05 }) : null;
        if (io) io.observe(stage); else visible = true;

        function ensureRunning() {
          if (!visible || running) return;
          running = true;
          rafId = requestAnimationFrame(loop);
        }
        function maybeStop(now) {
          if (now - lastMoveT > IDLE_MS && clickTime > 1.5) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            return true;
          }
          return false;
        }

        /* ---------------- render loop ---------------- */
        let last = performance.now();
        function loop(now) {
          if (!running) return;
          const dt = Math.min((now - last) / 1000, 0.05); last = now;
          clickTime += dt;

          gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
          gl.viewport(0, 0, SIM_W, SIM_H);
          gl.useProgram(simProg);
          bindQuad(simProg);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
          gl.uniform1i(simU.uPrev, 0);
          gl.uniform2f(simU.uMouse, mouse.x, mouse.y);
          gl.uniform2f(simU.uMouseVel, mouse.vx * 4.0, mouse.vy * 4.0);
          gl.uniform1f(simU.uMouseActive, mouse.active);
          gl.uniform2f(simU.uClickPos, clickPos[0], clickPos[1]);
          gl.uniform1f(simU.uClickTime, clickTime);
          gl.uniform1f(simU.uHasClick, hasClick);
          gl.uniform1f(simU.uTime, now * 0.001);
          gl.uniform1f(simU.uRadius, CFG.radius);
          gl.uniform1f(simU.uStrength, CFG.strength);
          const decay = mouse.active ? CFG.trailPersistence : CFG.releaseDecay;
          gl.uniform1f(simU.uDecay, decay);
          gl.uniform1f(simU.uAspect, stageW / Math.max(stageH, 1));
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          const tmp = fboA; fboA = fboB; fboB = tmp;

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(renderProg);
          bindQuad(renderProg);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textTex);
          gl.uniform1i(renderU.uText, 0);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
          gl.uniform1i(renderU.uTrail, 1);
          gl.uniform3fv(renderU.uColor1, CFG.colors[0]);
          gl.uniform3fv(renderU.uColor2, CFG.colors[1]);
          gl.uniform3fv(renderU.uColor3, CFG.colors[2]);
          gl.uniform3fv(renderU.uColor4, CFG.colors[3]);
          gl.uniform1f(renderU.uHueShift, CFG.hueShift);
          gl.uniform1f(renderU.uDisplace, CFG.displace);
          gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          mouse.vx *= 0.6; mouse.vy *= 0.6; // settle between move events
          if (clickTime > 1.5) hasClick = 0;

          if (!maybeStop(now)) rafId = requestAnimationFrame(loop);
        }

        function resize() {
          const ok = drawTextTexture();
          if (ok && !stage.classList.contains('fluid-ready')) {
            stage.classList.add('fluid-ready');
          }
          if (running) { /* keep looping, next frame reads new sizes */ }
          else { // paint a static frame so the resized canvas isn't blank
            ensureRunning();
            setTimeout(() => { if (performance.now() - lastMoveT > IDLE_MS && clickTime > 1.5) { running = false; if (rafId) cancelAnimationFrame(rafId); } }, 50);
          }
        }

        let resizeTimer;
        const onWinResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
        window.addEventListener('resize', onWinResize);

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => { if (!disposed) resize(); });
        } else {
          resize();
        }

        return () => {
          disposed = true;
          running = false;
          if (rafId) cancelAnimationFrame(rafId);
          if (io) io.disconnect();
          clearTimeout(resizeTimer);
          window.removeEventListener('resize', onWinResize);
          canvas.removeEventListener('pointermove', onMove);
          canvas.removeEventListener('pointerenter', onMove);
          canvas.removeEventListener('pointerleave', onLeave);
          canvas.removeEventListener('pointercancel', onLeave);
          canvas.removeEventListener('mouseleave', onLeave);
          canvas.removeEventListener('pointerdown', onClick);
          stage.classList.remove('fluid-ready');
        };
  }, []);

  return (
    <div className="fluid-stage" id="fluidStage" ref={stageRef}>
      <h1 className="disp fluid-text" id="fluidText" ref={textRef}>
        AI <span className="light">ENGINEER</span>
      </h1>
      <canvas className="fluid-canvas" id="fluidCanvas" ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
