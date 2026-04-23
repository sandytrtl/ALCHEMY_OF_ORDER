new p5(function (p) {

  let pourAnim  = null;
  let positions = [];
  let mechanic  = null; 
  const ps      = new ParticleSystem();

  /* ── SETUP ─────────────────────────────────────────────────── */
  p.setup = function () {
    const container = document.getElementById('p5-canvas-wrapper');

    const rect = container ? container.getBoundingClientRect() : null;
    const w = (rect && rect.width  > 0) ? rect.width  : p.windowWidth;
    const h = (rect && rect.height > 0) ? rect.height : p.windowHeight;

    const canvas = p.createCanvas(w, h);
    if (container) canvas.parent('p5-canvas-wrapper');
    p.colorMode(p.RGB);
    p.textFont('Crimson Text');
    p.frameRate(60);

    if (container && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        const r = container.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 &&
            (Math.abs(r.width - p.width) > 1 || Math.abs(r.height - p.height) > 1)) {
          p.resizeCanvas(r.width, r.height);
          _refreshLayout();
        }
      });
      ro.observe(container);
    }

    [100, 300, 600].forEach(ms => {
      setTimeout(() => {
        const r2 = container ? container.getBoundingClientRect() : null;
        if (r2 && r2.width > 0 && r2.height > 0 &&
            (Math.abs(r2.width - p.width) > 1 || Math.abs(r2.height - p.height) > 1)) {
          p.resizeCanvas(r2.width, r2.height);
          _refreshLayout();
        }
      }, ms);
    });
  };

  p.windowResized = function () {
    const container = document.getElementById('p5-canvas-wrapper');
    if (container) {
      const r = container.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        p.resizeCanvas(r.width, r.height);
        _refreshLayout();
      }
    }
  };

  /* ── LEVEL LOAD ─────────────────────────────────────────────── */
  window.addEventListener('loadLevel', (e) => {
    // Always hide the stability bar first
    if (typeof _showStabilityBar === 'function') _showStabilityBar(false);

    // Load level data
    Game.loadLevel(e.detail.levelId);

    // FIX: Pass timerConfig / hiddenConfig into the global slots the mechanic reads.
    // Without this, gameMechanics.unstable.onLevelLoad reads undefined configs
    // and defaults to drainPerSec=2 for every level, and more importantly
    // the mechanic never receives its correct setup for levels 16-25.
    const levelDef = Game.currentLevel;
    if (levelDef) {
      window._currentLevelTimerConfig  = levelDef.timerConfig  || null;
      window._currentLevelHiddenConfig = levelDef.hiddenConfig || null;
    }


    
    // Identify and initialise the mechanic for this level.
    // getMechanic() is defined last by gameMechanics.js (loaded after mechanics.js)
    // so it correctly returns objects from the gameMechanics{} namespace.
    if (typeof getMechanic === 'function') {
      mechanic = getMechanic(Game.currentLevel.mechanic);
    }
    if (mechanic && mechanic.onLevelLoad) {
      mechanic.onLevelLoad(Game.vials);
    }

    // Standard reset
    pourAnim = null;
    ps.clear();
    _refreshLayout();
    _syncHudFull();

    // Tutorial Logic
    if (window.TutorialManager) {
      if (e.detail.levelId === 1 && window._pendingTutorial) {
        window._pendingTutorial = false;
        setTimeout(() => {
          TutorialManager.syncPositions(positions, document.querySelector('#p5-canvas-wrapper canvas'));
          TutorialManager.start();
        }, 600);
      } else if (e.detail.levelId !== 1) {
        if (TutorialManager.isActive()) TutorialManager.end();
      }
    }
  });

  /* ── UNDO ───────────────────────────────────────────────────── */
  window.addEventListener('undoMove', () => {
    if (pourAnim) return;
    if (Game.undosRemaining <= 0) {
      showToast('No undos remaining!');
      return;
    }
    if (Game.undo()) {
      _refreshLayout();
      _syncHudFull();
    }
  });

  /* ── ADD VIAL ───────────────────────────────────────────────── */
  window.addEventListener('addVial', _handleAddVial);

  function _handleAddVial() {
    if (!Game.currentLevel) return;
    if (Game.isComplete) return;
    const cost = 300;
    if (!GameState.spendCoins(cost)) {
      showToast(`Need ${cost} 🪙 to add a vial!`);
      return;
    }
    Game.addEmptyVial();
    _refreshLayout();
    SoundManager.play('addVial');
    showToast('Empty vial added! 🧪');
  }

  // Hide the stability bar when leaving the gameplay screen
  window.addEventListener('screenChange', (e) => {
      const activeScreen = e.detail.screenId;
  const gameScreens = ['game', 'level-select-game'];
  if (!gameScreens.includes(activeScreen)) {
    if (typeof window.cleanupLevelState === 'function') {
      window.cleanupLevelState();
    }
  }
  });

  /* ── DRAW ───────────────────────────────────────────────────── */
  p.draw = function () {
    p.clear();

    if (!Game.currentLevel) {
      p.fill(139, 122, 106, 150);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Select a level to begin', p.width / 2, p.height / 2);
      return;
    }

    if (mechanic && mechanic.onUpdate) mechanic.onUpdate(Game.vials);

    if (pourAnim) {
      pourAnim.update();
      pourAnim.draw(p, VialRenderer.VIAL_W, VialRenderer.VIAL_H, VialRenderer.LAYER_H);

      if (pourAnim.done) {
        const { fromIdx, toIdx } = pourAnim;
        pourAnim = null;

        const result = Game.commitPour();

        if (positions[toIdx]) {
          ps.splash(positions[toIdx].x, positions[toIdx].y - VialRenderer.VIAL_H / 2, result.color, 10);
          ps.bubbles(positions[toIdx].x, positions[toIdx].y + VialRenderer.VIAL_H / 4, result.color, 4);
        }

        // Coin pop for each newly sealed vial
        if (result.newlySealed && result.newlySealed.length > 0) {
          SoundManager.play('star');
          result.newlySealed.forEach(vi => {
            if (positions[vi]) _showCoinPop(positions[vi].x, positions[vi].y - VialRenderer.VIAL_H / 2 - 20);
          });
        }

        if (mechanic) mechanic.onAfterPour(Game.vials[fromIdx], Game.vials[toIdx], Game.vials);

        if (window.TutorialManager && TutorialManager.isActive()) TutorialManager.onPourComplete();

        _syncHudFull();

        if (result.isComplete) {
          // Win — hide timer bar, play win sound, show win screen via GameBridge
          if (typeof _showStabilityBar === 'function') _showStabilityBar(false);
          SoundManager.play('win');
          setTimeout(() => window.GameBridge.triggerWin(), 500);
        } else if (result.isOutOfMoves) {
          // Move-limit exhausted — clean up then show lose screen via GameBridge
          if (typeof window.cleanupLevelState === 'function') window.cleanupLevelState();
          setTimeout(() => window.GameBridge.triggerOutOfMoves(), 600);
        }
      }
    }

    window._tutPositions = positions;
    if (window.TutorialManager && TutorialManager.isActive()) {
      TutorialManager.syncPositions(positions, p.canvas);
    }

    _drawAltar(p, positions);
    VialRenderer.drawAll(p, Game.vials, positions, Game.selectedIdx, mechanic);

    if (window.TutorialManager && TutorialManager.isActive()) {
      _drawTutorialHighlight(p, positions);
    }
    _drawMovesWarning();

    ps.update();
    ps.draw(p);
  };

  /* ── MOUSE ──────────────────────────────────────────────────── */
  p.mousePressed = function () {
    if (!Game.currentLevel || pourAnim || Game.isComplete || Game.isOutOfMoves) return;

    let clicked = -1;
    positions.forEach(({ x, y }, i) => {
      const top = y - VialRenderer.VIAL_H / 2;
      if (
        p.mouseX >= x - VialRenderer.VIAL_W / 2 &&
        p.mouseX <= x + VialRenderer.VIAL_W / 2 &&
        p.mouseY >= top &&
        p.mouseY <= top + VialRenderer.VIAL_H
      ) clicked = i;
    });

    if (clicked === -1) { Game.selectedIdx = -1; return; }

    if (window.TutorialManager && TutorialManager.isActive()) {
      const consumed = TutorialManager.onVialClicked(clicked);
      if (consumed) return;
    }

    // Block all interaction with locked vials before Game.handleClick runs.
    // Two cases:
    //   • Player taps a locked vial to select it as source → block.
    //   • Player has a vial selected and taps a locked vial as destination → block.
    if (mechanic && mechanic.onBeforePour) {
      const fromVial = Game.selectedIdx >= 0 ? Game.vials[Game.selectedIdx] : Game.vials[clicked];
      const toVial   = Game.vials[clicked];
      if (!mechanic.onBeforePour(fromVial, toVial)) {
        window.GameBridge.triggerInvalidMove();
        Witch.reject();
        return;
      }
    }

    const result = Game.handleClick(clicked);

    if (result === 'selected') {
      SoundManager.play('clickPotion');
      if (window.TutorialManager && TutorialManager.isActive() &&
          window._tapPourPending) {
        window._tapPourPending = false;
        const destIdx = window._tutEmptyCached;
        if (destIdx != null && destIdx >= 0) {
          setTimeout(function() {
            const r2 = Game.handleClick(destIdx);
            if (r2 === 'poured') {
              _startPourAnimation(Game.lastFromIdx, Game.lastToIdx);
            }
          }, 120);
        }
      }
    } else if (result === 'poured') {
      _startPourAnimation(Game.lastFromIdx, Game.lastToIdx);
    } else if (result === 'invalid') {
      window.GameBridge.triggerInvalidMove();
      Witch.reject();
    }
  };

  /* ── HELPERS ────────────────────────────────────────────────── */
  function _refreshLayout() {
    if (!Game.currentLevel) return;
    positions = Game.getPositions(p.width, p.height, VialRenderer.VIAL_W, VialRenderer.VIAL_H, 20);
  }

  function _startPourAnimation(fromIdx, toIdx) {
    SoundManager.play('pour');
    const color = Game.vials[fromIdx].topColor;
    pourAnim = new LiquidPour(positions[fromIdx], positions[toIdx], color);
    pourAnim.fromIdx = fromIdx;
    pourAnim.toIdx   = toIdx;
  }
  window._startPourAnimationExternal = _startPourAnimation;

  function _syncHudFull() {
    const movesEl  = document.getElementById('hud-moves');
    const limitEl  = document.getElementById('hud-moves-limit');
    const boxEl    = document.getElementById('hud-moves-box');
    const undoEl   = document.getElementById('undo-count');

    if (movesEl) movesEl.textContent = Game.movesUsed;
    if (limitEl) limitEl.textContent = `/ ${Game.movesLimit}`;
    if (boxEl) {
      if (Game.movesRemaining <= 5 && Game.movesRemaining > 0) boxEl.classList.add('warning');
      else boxEl.classList.remove('warning');
    }
    if (undoEl) {
      undoEl.textContent = Game.undosRemaining;
      undoEl.className   = 'undo-count' + (Game.undosRemaining === 0 ? ' empty' : '');
    }
    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) {
      if (Game.undosRemaining === 0) undoBtn.classList.add('depleted');
      else undoBtn.classList.remove('depleted');
    }
    var barEl = document.getElementById('moves-bar');
    if (barEl && Game.movesLimit > 0) {
      var ratio  = Math.min(1, Game.movesUsed / Game.movesLimit);
      var danger = Game.movesRemaining <= 3 && Game.movesRemaining > 0;
      barEl.style.transform = 'scaleX(' + (1 - ratio) + ')';
      if (danger) barEl.classList.add('danger'); else barEl.classList.remove('danger');
    }
    _syncHudStars(Game.currentStars);
    GameState.updateCoinDisplays();
  }

  function _syncHudStars(count) {
    const container = document.getElementById('hud-stars');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement('span');
      s.className   = 'star' + (i > count ? ' empty' : '');
      s.textContent = i <= count ? '⭐' : '☆';
      container.appendChild(s);
    }
  }

  function _drawMovesWarning() {
    const remaining = Game.movesRemaining;
    if (remaining > 5 || remaining <= 0) return;
    const pulse = 0.6 + 0.4 * Math.sin(p.frameCount * 0.15);
    p.fill(239, 68, 68, 220 * pulse);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(`⚠ ${remaining} move${remaining === 1 ? '' : 's'} remaining`, p.width / 2, p.height - 16);
  }

  /* ── TUTORIAL VIAL HIGHLIGHT ─────────────────────────────────── */
  function _drawTutorialHighlight(p, positions) {
    let targetIdx = window._tutSpotTarget;

    if (targetIdx == null || targetIdx === -1 || targetIdx === undefined) {
      const spec = window._tutSpotSpec;
      if (typeof spec === 'number' && spec >= 0) targetIdx = spec;
      else return;
    }

    const pos = positions[targetIdx];
    if (!pos) return;

    const VW  = VialRenderer.VIAL_W;
    const VH  = VialRenderer.VIAL_H;
    const t   = p.frameCount * 0.08;
    const pulse = 0.5 + 0.5 * Math.sin(t);

    p.noStroke();
    p.fill(4, 1, 18, 160);
    positions.forEach(function(vp, i) {
      if (i === targetIdx) return;
      if (window._tutEmptyCached != null && i === window._tutEmptyCached) return;
      if (window._tutFrom2Cached != null && i === window._tutFrom2Cached &&
          targetIdx === window._tutTo2Cached) return;
      p.rect(vp.x - VW/2 - 4, vp.y - VH/2 - 4, VW + 8, VH + 8, 8);
    });

    const expand = 14 + pulse * 12;
    p.drawingContext.shadowBlur  = 55 + pulse * 40;
    p.drawingContext.shadowColor = `rgba(233,196,106,${0.85 + pulse * 0.15})`;
    p.stroke(233, 196, 106, 190 + pulse * 65);
    p.strokeWeight(3.5);
    p.noFill();
    p.rect(pos.x - VW/2 - expand, pos.y - VH/2 - expand, VW + expand*2, VH + expand*2, 20);
    p.drawingContext.shadowBlur = 0;

    p.stroke(255, 230, 120, 130 + pulse * 90);
    p.strokeWeight(1.5);
    p.rect(pos.x - VW/2 - 4, pos.y - VH/2 - 4, VW + 8, VH + 8, 12);

    const arrowY = pos.y - VH/2 - 32 - pulse * 14;
    p.noStroke();
    p.drawingContext.shadowBlur  = 24;
    p.drawingContext.shadowColor = 'rgba(233,196,106,0.95)';
    p.fill(255, 220, 60, 230 + pulse * 25);
    p.textSize(26);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('▼', pos.x, arrowY);
    p.drawingContext.shadowBlur = 14;
    p.fill(255, 220, 60, 180 + pulse * 50);
    p.textSize(11);
    p.textFont('Crimson Text');
    p.text('TAP', pos.x, arrowY - 22);
    p.drawingContext.shadowBlur = 0;

    const isPourStep1 = window._tutFilledCached != null &&
                        window._tutFilledCached >= 0 &&
                        window._tutEmptyCached  != null &&
                        window._tutEmptyCached  >= 0 &&
                        targetIdx === window._tutFilledCached &&
                        positions[window._tutEmptyCached];
    const fromIdx = window._tutFilledCached;

    if (isPourStep1 && fromIdx >= 0) {
      const fromPos = positions[fromIdx];
      const toPos   = positions[window._tutEmptyCached];
      const segments = 10;
      const topColor = Game.vials[fromIdx] && Game.vials[fromIdx].topColor
        ? Game.vials[fromIdx].topColor : '#a855f7';

      let r = 168, g = 85, bv = 247;
      try {
        const hex = (topColor.startsWith('#') ? topColor : '#a855f7').replace('#','');
        r  = parseInt(hex.slice(0,2),16);
        g  = parseInt(hex.slice(2,4),16);
        bv = parseInt(hex.slice(4,6),16);
      } catch(e) {}

      const phase = (p.frameCount * 0.04) % 1;
      for (let i = 0; i < segments; i++) {
        let prog = ((i / segments) + phase) % 1;
        const mx  = (fromPos.x + toPos.x) / 2;
        const my  = Math.min(fromPos.y, toPos.y) - VH * 0.7;
        const bx  = (1-prog)*(1-prog)*fromPos.x + 2*(1-prog)*prog*mx + prog*prog*toPos.x;
        const by  = (1-prog)*(1-prog)*(fromPos.y - VH/2 - 10)
                  + 2*(1-prog)*prog*my
                  + prog*prog*(toPos.y - VH/2 - 10);
        const fade  = Math.sin(prog * Math.PI);
        const alpha = fade * (160 + pulse * 60);
        const dotR  = 3 + fade * 3;
        p.noStroke();
        p.drawingContext.shadowBlur  = 12;
        p.drawingContext.shadowColor = `rgba(${r},${g},${bv},0.8)`;
        p.fill(r, g, bv, alpha);
        p.circle(bx, by, dotR * 2);
      }
      p.drawingContext.shadowBlur = 0;

      const sealPulse = 0.4 + 0.6 * Math.abs(Math.sin(p.frameCount * 0.05));
      p.fill(255, 200, 80, 180 * sealPulse);
      p.noStroke();
      p.drawingContext.shadowBlur  = 16;
      p.drawingContext.shadowColor = 'rgba(255,200,80,0.7)';
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('🔒', toPos.x, toPos.y - VH/2 - 54 - pulse * 6);
      p.drawingContext.shadowBlur = 0;
    }

    p.noStroke();
    p.noFill();
  }

  /* ── ALTAR + DUST ───────────────────────────────────────────── */
  function _drawAltar(p, positions) {
    if (!positions || positions.length === 0) return;
    const xs   = positions.map(pos => pos.x).filter(isFinite);
    const ys   = positions.map(pos => pos.y).filter(isFinite);
    if (xs.length === 0 || ys.length === 0) return;
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const midY = ys.reduce((a,b)=>a+b,0)/ys.length;
    const VH = VialRenderer.VIAL_H, VW = VialRenderer.VIAL_W;
    const pad = VW * 1.2;
    const tableY = midY + VH/2 + 8;
    const tableW = (maxX - minX) + VW + pad * 2;
    const tableX = (minX + maxX) / 2;
    p.push();
    p.noStroke();
    p.fill(0,0,0,70);
    p.ellipse(tableX, tableY+22, tableW*0.9, 28);
    const ctx = p.drawingContext;
    const g = ctx.createLinearGradient(tableX-tableW/2, tableY, tableX+tableW/2, tableY+22);
    g.addColorStop(0,  'rgba(35,18,65,0.92)');
    g.addColorStop(0.4,'rgba(48,26,88,0.88)');
    g.addColorStop(1,  'rgba(18,8,38,0.95)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(tableX-tableW/2, tableY, tableW, 22, [0,0,8,8]);
    ctx.fill();
    const gTop = ctx.createLinearGradient(tableX-tableW/2, 0, tableX+tableW/2, 0);
    gTop.addColorStop(0,   'rgba(200,140,255,0.00)');
    gTop.addColorStop(0.15,'rgba(200,140,255,0.40)');
    gTop.addColorStop(0.5, 'rgba(233,196,106,0.65)');
    gTop.addColorStop(0.85,'rgba(200,140,255,0.40)');
    gTop.addColorStop(1,   'rgba(200,140,255,0.00)');
    ctx.fillStyle = gTop;
    ctx.fillRect(tableX-tableW/2, tableY, tableW, 2);
    const gIn = ctx.createRadialGradient(tableX,tableY+11,4,tableX,tableY+11,tableW/2);
    gIn.addColorStop(0,  'rgba(180,80,255,0.18)');
    gIn.addColorStop(0.6,'rgba(100,40,200,0.06)');
    gIn.addColorStop(1,  'rgba(0,0,0,0.00)');
    ctx.fillStyle = gIn;
    ctx.beginPath(); ctx.roundRect(tableX-tableW/2+2,tableY+2,tableW-4,18,[0,0,6,6]); ctx.fill();
    positions.forEach(function(pos) {
      var rx = pos.x;
      var rg = ctx.createRadialGradient(rx,tableY+2,2,rx,tableY+2,VW*0.6);
      rg.addColorStop(0,  'rgba(233,196,106,0.35)');
      rg.addColorStop(0.6,'rgba(233,196,106,0.08)');
      rg.addColorStop(1,  'rgba(0,0,0,0.00)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.ellipse(rx, tableY+3, VW*0.55, 7, 0, 0, Math.PI*2); ctx.fill();
    });
    p.pop();
    _drawDust(p, tableX, midY - VH/2, tableW);
  }

  var _dustParticles = null;
  function _drawDust(p, cx, topY, width) {
    if (!_dustParticles) {
      _dustParticles = [];
      for (var di=0; di<18; di++) {
        _dustParticles.push({
          x: cx + (Math.random()-0.5)*width*0.8,
          y: topY - Math.random()*80,
          vy: -(0.1 + Math.random()*0.25),
          r: 1 + Math.random()*2,
          a: Math.random()*Math.PI*2,
          life: Math.random(),
          gold: Math.random() > 0.5
        });
      }
    }
    _dustParticles.forEach(function(d) {
      d.y   += d.vy;
      d.x   += Math.sin(d.a + p.frameCount * 0.008) * 0.3;
      d.life = (d.life + 0.003) % 1;
      var alpha = d.life < 0.2 ? d.life/0.2 : d.life > 0.8 ? (1-d.life)/0.2 : 1;
      var base  = d.gold ? [233,196,106] : [168,85,247];
      p.noStroke();
      p.drawingContext.shadowBlur  = d.r * 4;
      p.drawingContext.shadowColor = 'rgba('+base[0]+','+base[1]+','+base[2]+','+(alpha*0.8)+')';
      p.fill(base[0], base[1], base[2], alpha * 160);
      p.circle(d.x, d.y, d.r * 2);
      p.drawingContext.shadowBlur = 0;
      if (d.y < topY - 120) {
        d.y = topY + 20;
        d.x = cx + (Math.random()-0.5)*width*0.7;
        d.life = 0;
      }
    });
  }

  function _showCoinPop(x, y) {
    const el = document.createElement('div');
    el.className = 'coin-pop';
    el.textContent = '+10 🪙';
    const wrapper = document.getElementById('p5-canvas-wrapper');
    const rect = wrapper ? wrapper.getBoundingClientRect() : { left:0, top:0 };
    el.style.left = (rect.left + x - 30) + 'px';
    el.style.top  = (rect.top  + y) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  /* ── GLOBAL STATE HELPERS ────────────────────────────────────── */

  window.handleBackToMenu = function() {
    if (window.TutorialManager && TutorialManager.isActive()) return;
    window.cleanupLevelState();
    if (typeof window.clearActiveMechanic === 'function') window.clearActiveMechanic();
    if (typeof Game !== 'undefined') Game.currentLevel = null;
    if (window.ScreenManager) ScreenManager.show('menu');
  };

  // Stops the timer and hides the stability bar.
  // Called on back/restart/win/lose so the bar never bleeds into other screens.
  window.cleanupLevelState = function() {
    if (typeof _showStabilityBar === 'function') _showStabilityBar(false);

    if (typeof gameMechanics !== 'undefined' && gameMechanics.unstable) {
      const self = gameMechanics.unstable;
      self._started      = false;
      self._failed       = true;
      self._meter        = 100;
      self._displayMeter = 100;
    }
  };

}, 'p5-canvas-wrapper');