const ScreenManager = (function () {
  let currentScreen = 'intro';
  let history = [];

  function show(id, data = {}) {
    const prev = document.getElementById('screen-' + currentScreen);
    const next = document.getElementById('screen-' + id);
    if (!next) { console.warn(`[ScreenManager] Screen not found: screen-${id}`); return; }

    history.push(currentScreen);
    if (history.length > 10) history.shift();

    if (prev) {
      prev.style.opacity = '0';
      setTimeout(() => { prev.classList.remove('active'); }, 300);
    }
    setTimeout(() => {
      next.classList.add('active');
      requestAnimationFrame(() => {
        next.style.opacity = '1';
        // Run screen-specific init AFTER the screen is visible
        if (id === 'menu')                                   initMenu();
        if (id === 'shop')                                   initShop();
        if (id === 'gameplay' && data.levelId !== undefined) startLevel(data.levelId);
        if (id === 'win' && data)                            showWin(data);
      });
    }, prev ? 200 : 0);

    currentScreen = id;
  }

  function back() {
    const prev = history.pop();
    if (prev) show(prev);
    else show('intro');
  }

  return { show, back, current: () => currentScreen };
})();


/* ── GLOBAL AMBIENT PARTICLES (dark void outside intro window) ── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const PALETTE = [
    { fill: '#a855f7', glow: '#7c3aed' },
    { fill: '#2dd4bf', glow: '#0d9488' },
    { fill: '#f472b6', glow: '#db2777' },
    { fill: '#fb923c', glow: '#ea580c' },
    { fill: '#e9c46a', glow: '#c9933a' },
    { fill: '#60a5fa', glow: '#2563eb' },
  ];

  const orbs = [], sparkles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeOrb() {
    const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const size = Math.random() * 6 + 2;
    return {
      col, size,
      x: Math.random() * W, y: H + size + Math.random() * 60,
      speed: Math.random() * 0.45 + 0.12,
      drift: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.55 + 0.2,
      life: 1, decay: Math.random() * 0.0018 + 0.0008,
      wobAmp: Math.random() * 2 + 0.5,
      wobSpd: Math.random() * 0.03 + 0.015,
      wobPhs: Math.random() * Math.PI * 2,
      frame: 0,
    };
  }

  function makeSparkle() {
    const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      col, x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      life: 1, decay: Math.random() * 0.015 + 0.005,
    };
  }

  for (let i = 0; i < 55; i++) { const o = makeOrb(); o.y = Math.random() * H; orbs.push(o); }
  for (let i = 0; i < 80; i++) sparkles.push(makeSparkle());

  function animate() {
    ctx.clearRect(0, 0, W, H);

    orbs.forEach((o, i) => {
      o.frame++; o.y -= o.speed;
      o.x += o.drift + Math.sin(o.frame * o.wobSpd + o.wobPhs) * o.wobAmp * 0.04;
      o.life -= o.decay;
      if (o.y + o.size < 0 || o.life <= 0) { orbs[i] = makeOrb(); return; }
      const a = o.alpha * o.life;
      ctx.save();
      ctx.globalAlpha = a * 0.3; ctx.fillStyle = o.col.glow;
      ctx.shadowBlur = 22; ctx.shadowColor = o.col.glow;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.size * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a; ctx.shadowBlur = 10; ctx.shadowColor = o.col.fill;
      ctx.fillStyle = o.col.fill;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * 0.55; ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(o.x - o.size*0.32, o.y - o.size*0.32, o.size*0.28, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });

    sparkles.forEach((s, i) => {
      s.life -= s.decay;
      if (s.life <= 0) { sparkles[i] = makeSparkle(); return; }
      ctx.save();
      ctx.globalAlpha = s.alpha * s.life; ctx.fillStyle = s.col.fill;
      ctx.shadowBlur = 6; ctx.shadowColor = s.col.fill;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize(); animate();
})();


(function initSmoke() {

  function buildSmokeSystem(canvasId, cfg) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, puffs = [];

    function resize() {
      // Match CSS-laid-out size so % units in CSS align with canvas px
      W = canvas.width  = canvas.offsetWidth  || 1;
      H = canvas.height = canvas.offsetHeight || 1;
    }

    function hex2rgb(hex) {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return [r, g, b];
    }

    function makePuff(preAge) {
      preAge = preAge || 0;
      const col = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const [r, g, b] = hex2rgb(col);
      // Spawn at jar mouth: bottom-center ± narrow spread
      const spawnX = W * cfg.mouthX + (Math.random() - 0.5) * W * cfg.mouthSpread;
      const startSize = Math.random() * cfg.sizeMin + cfg.sizeBase;
      const grow      = Math.random() * 0.18 + 0.06;
      const p = {
        r, g, b,
        x:     spawnX,
        y:     H * cfg.mouthY,
        vx:    (Math.random() - 0.5) * cfg.driftX,
        vy:    -(Math.random() * cfg.speedMax + cfg.speedMin),
        size:  startSize,
        grow,
        alpha: Math.random() * cfg.alphaRange + cfg.alphaBase,
        life:  1,
        decay: Math.random() * cfg.decayRange + cfg.decayBase,
        wobAmp:  (Math.random() - 0.5) * cfg.wobble,
        wobSpd:  Math.random() * 0.04 + 0.015,
        wobPhs:  Math.random() * Math.PI * 2,
        frame: 0,
      };
      // Pre-age: advance puff so smoke is mid-stream on load
      if (preAge > 0) {
        const steps = Math.floor(preAge * 120);
        for (let s = 0; s < steps; s++) {
          p.frame++;
          p.y    += p.vy;
          p.x    += p.vx + Math.sin(p.frame * p.wobSpd + p.wobPhs) * p.wobAmp;
          p.size += p.grow;
          p.life -= p.decay;
          if (p.life <= 0) break;
        }
      }
      return p;
    }

    // Pre-populate so smoke is already flowing
    for (let i = 0; i < cfg.count; i++) {
      puffs.push(makePuff(Math.random()));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Steady spawn rate
      if (Math.random() < cfg.spawnRate) puffs.push(makePuff(0));

      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.frame++;
        p.life -= p.decay;
        if (p.life <= 0 || p.y + p.size < -20) { puffs.splice(i, 1); continue; }

        p.y    += p.vy;
        p.x    += p.vx + Math.sin(p.frame * p.wobSpd + p.wobPhs) * p.wobAmp;
        p.size += p.grow;

        // Ease-in-out alpha: fade in quickly, linger, fade out
        const t = 1 - p.life;
        const fadeIn  = Math.min(1, t * 8);
        const fadeOut = p.life * p.life;
        const a       = p.alpha * fadeIn * fadeOut;

        if (a < 0.005) continue;
        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.size) || p.size <= 0) continue;

        ctx.save();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${(a * 0.85).toFixed(3)})`);
        grad.addColorStop(0.45,`rgba(${p.r},${p.g},${p.b},${(a * 0.45).toFixed(3)})`);
        grad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(draw);
    }

    new ResizeObserver(() => { resize(); }).observe(canvas);
    resize();
    draw();
  }

  
  buildSmokeSystem('smoke-left', {
    colors:      ['#9a8A7a', '#b09a88', '#7a6858', '#c8b8a8', '#a09080'],
    mouthX:      0.50,
    mouthY:      0.10,
    mouthSpread: 0.16,
    sizeBase:    10, sizeMin: 12,
    speedMin:    0.30, speedMax: 0.55,
    driftX:      0.30,
    wobble:      1.0,
    alphaBase:   0.13, alphaRange: 0.17,
    decayBase:   0.004, decayRange: 0.005,
    spawnRate:   0.22,
    count:       22,
  });

  buildSmokeSystem('smoke-right', {
    colors:      ['#8020d0', '#9b5cf6', '#6d28d9', '#2dd4bf', '#0d9488', '#a855f7'],
    mouthX:      0.50,
    mouthY:      0.10,
    mouthSpread: 0.20,
    sizeBase:    12, sizeMin: 14,
    speedMin:    0.35, speedMax: 0.65,
    driftX:      0.40,
    wobble:      1.5,
    alphaBase:   0.16, alphaRange: 0.22,
    decayBase:   0.003, decayRange: 0.005,
    spawnRate:   0.28,
    count:       28,
  });

})();


(function initMenuParticles() {
  let started = false;

  function start() {
    if (started) return;
    const canvas = document.getElementById('menu-particles');
    if (!canvas) return;

    // Defer until canvas has real dimensions (screen must be fully visible)
    const w = canvas.offsetWidth || (canvas.parentElement && canvas.parentElement.offsetWidth);
    if (!w) { requestAnimationFrame(start); return; }

    started = true;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    const PALETTE = [
      { fill: '#a855f7', glow: '#7c3aed' },
      { fill: '#2dd4bf', glow: '#0d9488' },
      { fill: '#f472b6', glow: '#db2777' },
      { fill: '#fb923c', glow: '#ea580c' },
      { fill: '#e9c46a', glow: '#c9933a' },
      { fill: '#60a5fa', glow: '#2563eb' },
    ];
    const orbs = [], sparkles = [];

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = canvas.width  = r.width  || canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = r.height || canvas.offsetHeight || window.innerHeight;
    }
    function makeOrb() {
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const size = Math.random() * 5 + 1.5;
      return { col, size,
        x: Math.random() * W, y: H + size + Math.random() * 60,
        speed: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.18,
        life: 1, decay: Math.random() * 0.0018 + 0.0008,
        wobAmp: Math.random() * 2 + 0.5,
        wobSpd: Math.random() * 0.03 + 0.015,
        wobPhs: Math.random() * Math.PI * 2,
        frame: 0 };
    }
    function makeSparkle() {
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return { col, x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        life: 1, decay: Math.random() * 0.012 + 0.004 };
    }

    resize();
    for (let i = 0; i < 45; i++) { const o = makeOrb(); o.y = Math.random() * H; orbs.push(o); }
    for (let i = 0; i < 70; i++) sparkles.push(makeSparkle());
    new ResizeObserver(resize).observe(canvas);

    function animate() {
      if (!W || !H) { resize(); requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, W, H);
      orbs.forEach((o, i) => {
        o.frame++; o.y -= o.speed;
        o.x += o.drift + Math.sin(o.frame * o.wobSpd + o.wobPhs) * o.wobAmp * 0.04;
        o.life -= o.decay;
        if (o.y + o.size < 0 || o.life <= 0) { orbs[i] = makeOrb(); return; }
        const a = o.alpha * o.life;
        ctx.save();
        ctx.globalAlpha = a * 0.28; ctx.fillStyle = o.col.glow;
        ctx.shadowBlur = 20; ctx.shadowColor = o.col.glow;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.size * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a; ctx.shadowBlur = 8; ctx.shadowColor = o.col.fill;
        ctx.fillStyle = o.col.fill;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a * 0.5; ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(o.x - o.size*0.32, o.y - o.size*0.32, o.size*0.28, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
      sparkles.forEach((s, i) => {
        s.life -= s.decay;
        if (s.life <= 0) { sparkles[i] = makeSparkle(); return; }
        ctx.save();
        ctx.globalAlpha = s.alpha * s.life; ctx.fillStyle = s.col.fill;
        ctx.shadowBlur = 5; ctx.shadowColor = s.col.fill;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  window._startMenuParticles = start;
})();

function initMenu() {
  if (window._startMenuParticles) window._startMenuParticles();
  GameState.updateCoinDisplays();
  const grid = document.getElementById('level-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const mechIcons = {
    none: '', fading: '👁', rune: '🔒',
    catalyst: '⚗', unstable: '⚡', combined: '🌀',
  };

  LEVEL_DATA.all().forEach(level => {
    const unlocked = GameState.state.unlockedLevels.includes(level.id);
    const stars    = GameState.state.levelStars[level.id] || 0;
    const btn = document.createElement('button');
    btn.className = 'level-btn ' + (unlocked ? 'unlocked' : 'locked');
    btn.title = level.name;

    let starsHTML = '';
    for (let i = 1; i <= 3; i++)
      starsHTML += `<span class="${i <= stars ? 'star' : 'star empty'}">${i <= stars ? '⭐' : '☆'}</span>`;

    const icon = mechIcons[level.mechanic] || '';
    btn.innerHTML = `
      ${icon ? `<span class="mechanic-badge">${icon}</span>` : ''}
      <span class="lvl-num">${level.id}</span>
      <span class="lvl-stars">${starsHTML}</span>
    `;
    if (unlocked) btn.onclick = () => {
      SoundManager.play('clickGeneral');
      // Signal tutorial to show when navigating to level 1
      if (level.id === 1) window._pendingTutorial = true;
      ScreenManager.show('gameplay', { levelId: level.id });
    };
    grid.appendChild(btn);
  });
}



function startLevel(levelId) {
  const level = LEVEL_DATA.get(levelId);
  if (!level) return;
  const nameEl  = document.getElementById('hud-level-name');
  const movesEl = document.getElementById('hud-moves');
  const limitEl = document.getElementById('hud-moves-limit');
  const starsEl = document.getElementById('hud-stars');
  const boxEl   = document.getElementById('hud-moves-box');
  if (nameEl)  nameEl.textContent  = `Level ${level.id} — ${level.name}`;
  if (movesEl) movesEl.textContent = '0';
  if (limitEl) limitEl.textContent = `/ ${level.starThresholds[1]}`;
  if (starsEl) starsEl.innerHTML   = '⭐⭐⭐';
  if (boxEl)   boxEl.classList.remove('warning');
  GameState.updateCoinDisplays();

  // Show mechanic intro popup first time player reaches this level,
  // then dispatch the loadLevel event once they dismiss it
  if (window.MechanicIntro) {
    MechanicIntro.maybeShow(levelId, () => {
      window.dispatchEvent(new CustomEvent('loadLevel', { detail: { levelId } }));
      if (level.hint) _showLevelHint(level.hint);
    });
  } else {
    window.dispatchEvent(new CustomEvent('loadLevel', { detail: { levelId } }));
    if (level.hint) _showLevelHint(level.hint);
  }
}

function _showLevelHint(text) {
  // Remove any existing hint
  const old = document.getElementById('level-hint-toast');
  if (old) old.remove();

  const el = document.createElement('div');
  el.id = 'level-hint-toast';
  el.innerHTML = `<span style="color:rgba(168,85,247,.8);margin-right:6px">&#9670;</span>${text}`;
  el.style.cssText = `
    position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,rgba(28,16,58,.97),rgba(10,6,22,.99));
    border:1px solid rgba(201,147,58,.4); border-radius:12px;
    padding:12px 22px; z-index:8000; pointer-events:none;
    font-family:'Crimson Text',serif; font-size:15px;
    color:rgba(232,217,192,.9); letter-spacing:.3px;
    box-shadow:0 0 30px rgba(168,85,247,.2),0 8px 30px rgba(0,0,0,.7);
    max-width:min(480px,88vw); text-align:center; line-height:1.5;
    animation:hint-in .4s cubic-bezier(.34,1.4,.64,1) both;
  `;
  document.head.insertAdjacentHTML('beforeend',
    `<style>@keyframes hint-in{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>`
  );
  document.body.appendChild(el);
  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    el.style.transition = 'opacity .5s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 6000);
}

function triggerInvalidMove() {
  SoundManager.play('invalid');
  const flash = document.getElementById('invalid-flash');
  if (!flash) return;
  flash.classList.remove('flash');
  void flash.offsetWidth;
  flash.classList.add('flash');
  setTimeout(() => flash.classList.remove('flash'), 500);
}

function triggerWin() {
  const level = Game.currentLevel, stars = Game.currentStars;
  const moves = Game.movesUsed,   reward = level.scaledReward(stars);
  const levelId = level.id;
  GameState.completeLevel(levelId, moves, level.expectedMoves, stars, reward);
  ScreenManager.show('win', {
    stars, moves, par: level.expectedMoves,
    coins: reward, nextLevelId: levelId < 25 ? levelId + 1 : null,
  });
}

function triggerOutOfMoves() {
  showToast('⚠ Out of moves! Try again.');
  ScreenManager.show('win', {
    stars: 0, moves: Game.movesUsed,
    par: Game.currentLevel.expectedMoves,
    coins: 0, nextLevelId: null, failed: true,
  });
}

function showWin(data) {
  const movesEl    = document.getElementById('win-moves');
  const parEl      = document.getElementById('win-par');
  const coinsEl    = document.getElementById('win-coins');
  const starsEl    = document.getElementById('win-stars');
  const titleEl    = document.getElementById('win-title-text');
  const subtitleEl = document.getElementById('win-subtitle-label');
  const nextBtn    = document.getElementById('btn-next-level');

  if (movesEl) movesEl.textContent = data.moves;
  if (parEl)   parEl.textContent   = data.par;
  if (coinsEl) coinsEl.textContent = data.failed ? '+0' : '+' + data.coins;

  if (titleEl) {
    titleEl.textContent = data.failed ? 'Out of Moves!' : 'Order Restored!';
    titleEl.style.color = data.failed ? '#f87171' : '';
  }
  if (subtitleEl) {
    subtitleEl.textContent = data.failed ? 'Keep Practicing' : 'Level Complete';
  }

  if (starsEl) {
    starsEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement('span');
      s.className   = 'win-star' + (i > data.stars ? ' empty' : '');
      s.textContent = i <= data.stars ? '⭐' : '☆';
      starsEl.appendChild(s);
    }
  }

  if (nextBtn) {
    if (!data.failed && data.nextLevelId && GameState.state.unlockedLevels.includes(data.nextLevelId)) {
      nextBtn.style.display = '';
      nextBtn.innerHTML = 'Next Level <span class="win-btn-star">✦</span>';
      nextBtn.onclick = () => { SoundManager.play('clickGeneral'); ScreenManager.show('gameplay', { levelId: data.nextLevelId }); };
    } else if (data.failed) {
      nextBtn.style.display = '';
      nextBtn.innerHTML = '↺ Try Again';
      const retryId = Game.currentLevel ? Game.currentLevel.id : 1;
      nextBtn.onclick = () => { SoundManager.play('clickGeneral'); ScreenManager.show('gameplay', { levelId: retryId }); };
    } else {
      nextBtn.style.display = 'none';
    }
  }

  // Fire particle burst only on success
  if (!data.failed) _winParticleBurst(data.stars);
}

/* ── WIN PARTICLE BURST ───────────────────────────────────────── */
function _winParticleBurst(stars) {
  const canvas = document.getElementById('win-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H * 0.38;

  const COLORS = ['#fbbf24','#f0c060','#a855f7','#2dd4bf','#f472b6','#c9933a','#ffe090'];
  const count  = 60 + stars * 18;
  const parts  = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + 2;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      r: Math.random() * 5 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: Math.random() * 0.015 + 0.012,
      spin: (Math.random() - 0.5) * 0.3,
      type: Math.random() < 0.4 ? 'star' : 'circle',
    });
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    parts.forEach(p => {
      if (p.life <= 0) return;
      p.life -= p.decay;
      if (p.life <= 0) return;
      alive = true;
      p.vy += 0.18;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= 0.99;
      ctx.save();
      ctx.globalAlpha = p.life * p.life;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin * (1 - p.life) * 20);
      if (p.type === 'star') {
        ctx.font = `${p.r * 3}px serif`;
        ctx.fillText('✦', -p.r, p.r);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, W, H);
  }
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  const undoBtn  = document.getElementById('btn-undo');
  const beginBtn = document.getElementById('btn-begin');
  const addVial  = document.getElementById('btn-add-vial');
  if (undoBtn)  undoBtn.onclick  = () => { SoundManager.play('clickGeneral'); window.dispatchEvent(new CustomEvent('undoMove')); };
  if (beginBtn) beginBtn.onclick = () => { SoundManager.play('clickGeneral'); ScreenManager.show('menu'); };
  if (addVial)  addVial.onclick  = () => { window.dispatchEvent(new CustomEvent('addVial')); };

  // Clear old tutorial-done flag so the new flag-based system takes over
  try { localStorage.removeItem('alchemy_tutorial_done'); } catch(e) {}
  // Clear old mechanic intro format (pre-versioned) so intros show correctly
  try {
    const raw = localStorage.getItem('aoo_seen_intros');
    if (raw && Array.isArray(JSON.parse(raw))) {
      localStorage.removeItem('aoo_seen_intros'); // wipe old unversioned format
    }
  } catch(e) {}
  window._pendingTutorial = false;

  // Inject 4 corner sparkle stars into .banner-text
  // These are positioned via CSS nth-child selectors
  const bannerText = document.querySelector('.banner-text');
  if (bannerText) {
    for (let i = 0; i < 4; i++) {
      const star = document.createElement('span');
      star.className = 'banner-star';
      bannerText.appendChild(star);
    }
  }
});

window.GameBridge = { triggerInvalidMove, triggerWin, triggerOutOfMoves };


let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2500);
}