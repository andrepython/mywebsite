/* globe.js – Fuller/Dymaxion-inspired particle background
   Renders a simplified icosahedral unfolded map (Fuller projection)
   with animated ocean waves, glowing particles, and clickable continent zones.
   Each zone triggers a tab reveal via custom events.
*/
(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, cx, cy, scale, isPortrait;

  /* ══════════════════════════════════════════════════
     FULLER PROJECTION DATA
     Simplified continent polygons in normalised [-1,1] space,
     mapped from the unfolded icosahedron layout.
     Coordinates are [x, y] in projection space.
  ══════════════════════════════════════════════════ */
  const PROJ = {
    // Each continent defined as a polygon path in "projection normalised" coords
    // These are hand-crafted to approximate the Fuller/Dymaxion layout
    europe: [
      [-0.05,  0.10], [ 0.12,  0.08], [ 0.18, -0.02], [ 0.10, -0.12],
      [-0.02, -0.15], [-0.12, -0.08], [-0.14,  0.02], [-0.05,  0.10]
    ],
    asia: [
      [ 0.18,  0.08], [ 0.45,  0.18], [ 0.55,  0.05], [ 0.48, -0.10],
      [ 0.35, -0.20], [ 0.20, -0.18], [ 0.10, -0.12], [ 0.18, -0.02], [ 0.18,  0.08]
    ],
    africa: [
      [-0.02, -0.15], [ 0.10, -0.12], [ 0.20, -0.18], [ 0.18, -0.42],
      [ 0.05, -0.52], [-0.08, -0.48], [-0.14, -0.35], [-0.12, -0.20], [-0.02, -0.15]
    ],
    americas: [
      [-0.55,  0.28], [-0.35,  0.22], [-0.22,  0.10], [-0.25, -0.05],
      [-0.35, -0.12], [-0.38, -0.35], [-0.48, -0.42], [-0.60, -0.28],
      [-0.65,  0.10], [-0.55,  0.28]
    ],
    oceania: [
      [ 0.35, -0.42], [ 0.52, -0.38], [ 0.58, -0.48], [ 0.48, -0.58],
      [ 0.35, -0.54], [ 0.30, -0.48], [ 0.35, -0.42]
    ],
    antarctica: [
      [-0.30, -0.62], [ 0.30, -0.62], [ 0.22, -0.72], [-0.22, -0.72], [-0.30, -0.62]
    ]
  };

  // Which tab each continent triggers
  const CONTINENT_TABS = {
    europe:     'welcome',
    asia:       'research',
    africa:     'terrorism',
    americas:   'blog',
    oceania:    'teaching',
    antarctica: 'about'
  };

  // Colors per continent (dark land tones)
  const CONTINENT_COLORS = {
    europe:     { fill: '#0e3a2a', stroke: '#3ec6c6', hover: '#1a5c3a' },
    asia:       { fill: '#0d3530', stroke: '#3ec6c6', hover: '#1a5540' },
    africa:     { fill: '#1a3010', stroke: '#7fead9', hover: '#2a5015' },
    americas:   { fill: '#0f2e3a', stroke: '#3ec6c6', hover: '#165060' },
    oceania:    { fill: '#132a20', stroke: '#7fead9', hover: '#204535' },
    antarctica: { fill: '#1a2a38', stroke: '#a0d8ef', hover: '#253c50' }
  };

  /* ══════════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════════ */
  let hoveredContinent = null;
  let particles        = [];
  let waveOffset       = 0;
  let animId;

  /* ══════════════════════════════════════════════════
     COORDINATE HELPERS
  ══════════════════════════════════════════════════ */
  function projToScreen(px, py) {
    // Portrait: taller map, centred
    // Landscape: wider map
    const aspect = isPortrait ? 0.72 : 1.4;
    const sx = cx + px * scale * aspect;
    const sy = cy - py * scale; // y flipped (positive up in proj space)
    return [sx, sy];
  }

  function buildPath(polygon) {
    ctx.beginPath();
    polygon.forEach(([px, py], i) => {
      const [sx, sy] = projToScreen(px, py);
      if (i === 0) ctx.moveTo(sx, sy);
      else         ctx.lineTo(sx, sy);
    });
    ctx.closePath();
  }

  function isInsideContinent(mx, my, name) {
    buildPath(PROJ[name]);
    return ctx.isPointInPath(mx, my);
  }

  /* ══════════════════════════════════════════════════
     PARTICLES
  ══════════════════════════════════════════════════ */
  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 12000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x:   Math.random() * W,
        y:   Math.random() * H,
        r:   0.5 + Math.random() * 1.5,
        vx:  (Math.random() - 0.5) * 0.18,
        vy:  (Math.random() - 0.5) * 0.12,
        a:   Math.random(),
        da:  (Math.random() - 0.5) * 0.004,
        hue: 170 + Math.random() * 40   // teal range
      });
    }
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.da;
      if (p.a > 1 || p.a < 0) p.da = -p.da;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},70%,65%,${p.a * 0.5})`;
      ctx.fill();
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const alpha = (1 - dist / 80) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(62,198,198,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ══════════════════════════════════════════════════
     OCEAN WAVES
  ══════════════════════════════════════════════════ */
  function drawOcean() {
    // Deep gradient base
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    grad.addColorStop(0,   '#06182a');
    grad.addColorStop(0.5, '#040f1c');
    grad.addColorStop(1,   '#02080f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Animated wave rings
    const numWaves = 5;
    for (let w = 0; w < numWaves; w++) {
      const phase = (waveOffset + w / numWaves) % 1;
      const radius = phase * Math.max(W, H) * 0.55 + scale * 0.1;
      const alpha  = (1 - phase) * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(62,198,198,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Subtle grid lines (icosahedron triangulation hint)
    drawGridLines();
  }

  function drawGridLines() {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#3ec6c6';
    ctx.lineWidth = 0.6;

    const step = scale * 0.22;
    for (let x = cx % step; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = cy % step; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Diagonal lines (Fuller triangulation)
    for (let d = -W; d < W + H; d += step * 1.73) {
      ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + H, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d - H, H); ctx.stroke();
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════
     CONTINENTS
  ══════════════════════════════════════════════════ */
  function drawContinents() {
    Object.entries(PROJ).forEach(([name, poly]) => {
      const col = CONTINENT_COLORS[name];
      const isHovered = hoveredContinent === name;

      buildPath(poly);

      // Shadow / glow for hovered
      if (isHovered) {
        ctx.save();
        ctx.shadowColor  = col.stroke;
        ctx.shadowBlur   = 22;
        ctx.fillStyle    = col.hover;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = col.fill;
        ctx.fill();
      }

      // Stroke
      ctx.strokeStyle = isHovered ? col.stroke : `${col.stroke}55`;
      ctx.lineWidth   = isHovered ? 1.5 : 0.8;
      ctx.stroke();

      // Label
      drawContinentLabel(name, poly, isHovered);
    });
  }

  function getCentroid(poly) {
    let sx = 0, sy = 0;
    poly.forEach(([px, py]) => { sx += px; sy += py; });
    const [scx, scy] = projToScreen(sx / poly.length, sy / poly.length);
    return [scx, scy];
  }

  function drawContinentLabel(name, poly, hovered) {
    const [lx, ly] = getCentroid(poly);
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    ctx.save();
    ctx.font         = `${hovered ? 600 : 400} ${scale * 0.032}px Inter, sans-serif`;
    ctx.fillStyle    = hovered ? '#7fead9' : 'rgba(200,232,240,0.45)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (hovered) {
      ctx.shadowColor = '#3ec6c6';
      ctx.shadowBlur  = 8;
    }
    ctx.fillText(label, lx, ly);
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════
     COMPASS ROSE (subtle)
  ══════════════════════════════════════════════════ */
  function drawCompass() {
    const x = W - 48, y = H - 60, r = 18;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#3ec6c6';
    ctx.lineWidth   = 1;

    // Circle
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();

    // N / S / E / W lines
    [[0,-1,'N'],[0,1,'S'],[1,0,'E'],[-1,0,'W']].forEach(([dx, dy, lbl]) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx * r, y + dy * r);
      ctx.stroke();
      ctx.font = '7px Inter, sans-serif';
      ctx.fillStyle = '#3ec6c6';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, x + dx * (r + 7), y + dy * (r + 7));
    });
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════
     MAIN RENDER LOOP
  ══════════════════════════════════════════════════ */
  function draw(ts) {
    waveOffset = (ts * 0.00012) % 1;

    drawOcean();
    drawParticles();
    updateParticles();
    drawContinents();
    drawCompass();

    animId = requestAnimationFrame(draw);
  }

  /* ══════════════════════════════════════════════════
     RESIZE
  ══════════════════════════════════════════════════ */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    scale      = Math.min(W, H) * 0.82;
    isPortrait = H > W;
    createParticles();
  }

  /* ══════════════════════════════════════════════════
     MOUSE / TOUCH INTERACTION
     Canvas is pointer-events: none in CSS, so we
     attach listeners to the document and convert coords.
  ══════════════════════════════════════════════════ */
  function getCoords(e) {
    if (e.touches) return [e.touches[0].clientX, e.touches[0].clientY];
    return [e.clientX, e.clientY];
  }

  function onMove(e) {
    const [mx, my] = getCoords(e);
    let found = null;
    Object.keys(PROJ).forEach(name => {
      if (isInsideContinent(mx, my, name)) found = name;
    });
    if (found !== hoveredContinent) {
      hoveredContinent = found;
      canvas.style.cursor = found ? 'none' : 'default';
      document.body.style.cursor = found ? 'pointer' : '';
    }
  }

  function onClick(e) {
    const [mx, my] = getCoords(e);
    Object.keys(PROJ).forEach(name => {
      if (isInsideContinent(mx, my, name)) {
        const tab = CONTINENT_TABS[name];
        document.dispatchEvent(new CustomEvent('continentClick', { detail: { tab, continent: name } }));
      }
    });
  }

  // Use document-level for full-page detection; canvas is decorative
  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('click',     onClick);
  document.addEventListener('touchend',  e => { e.preventDefault(); onClick(e); }, { passive: false });

  /* ══════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════ */
  resize();
  window.addEventListener('resize', () => { resize(); });
  requestAnimationFrame(draw);

  // Expose for app.js
  window.globeAPI = { getContinentForTab };

  function getContinentForTab(tabId) {
    return Object.entries(CONTINENT_TABS).find(([, t]) => t === tabId)?.[0] || null;
  }

}());
