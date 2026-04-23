const gameMechanics = {

  none: {
    onLevelLoad()   {},
    onBeforePour()  { return true; },
    onAfterPour()   {},
    onDrawVial()    {},
    onUpdate()      {},
  },

  fading: {
    VISIBLE_MS: 3000,
    FADE_MS:    2000,

    onLevelLoad(vials) {
      vials.forEach(v => {
        if (v.mechanic === 'fading') {
          v.fadingTimer    = Date.now();
          v.fadingProgress = 1;
        }
      });
    },

    onBeforePour() { return true; },
    onAfterPour()  {},

    onDrawVial(p, vial, x, y, vialW, vialH) {
      if (vial.mechanic !== 'fading') return;
      const alpha = 255 * (1 - vial.fadingProgress);
      if (alpha <= 0) return;
      p.noStroke();
      p.fill(15, 10, 30, alpha);
      p.rect(x - vialW/2, y - vialH/2, vialW, vialH, 6, 6, 16, 16);
      if (vial.fadingProgress < 0.1) {
        p.fill(139, 122, 106, 180);
        p.textSize(22);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('?', x, y);
      }
    },

    onUpdate(vials) {
      const now = Date.now();
      vials.forEach(v => {
        if (v.mechanic !== 'fading' || v.fadingTimer == null) return;
        const elapsed = now - v.fadingTimer;
        if (elapsed < this.VISIBLE_MS) {
          v.fadingProgress = 1;
        } else {
          const fadeElapsed = elapsed - this.VISIBLE_MS;
          v.fadingProgress  = Math.max(0, 1 - fadeElapsed / this.FADE_MS);
        }
      });
    },
  },

  rune: {

    onLevelLoad(vials) {
      vials.forEach(v => {
        if (v.lockColor) {
          v.isLocked   = true;
          v.unlockAnim = 0;
        }
      });
    },

    onBeforePour(from, to) {
      const vials  = window.game ? window.game.vials : [];
      const vFrom  = (typeof from === 'number') ? vials[from] : from;
      const vTo    = (typeof to   === 'number') ? vials[to]   : to;

      if (vFrom && vFrom.isLocked) return false;
      if (vTo   && vTo.isLocked)   return false;
      return true;
    },

    onAfterPour(from, to, allVials) {
      const levelId        = window.Game && Game.currentLevel ? Game.currentLevel.id : 0;
      const useCircleLock  = levelId >= 11;

      const sealedColors = new Set();
      allVials.forEach(v => {
        if (
          v.layers.length === 4 &&
          v.layers.every(c => c === v.layers[0])
        ) {
          sealedColors.add(v.layers[0]);
        }
      });

      allVials.forEach(lv => {
        if (!lv.isLocked) return;

        const triggerColor = useCircleLock
          ? (lv.lockCircleColor || lv.lockColor)
          : lv.lockColor;

        if (triggerColor && sealedColors.has(triggerColor)) {
          lv.isLocked   = false;
          lv.unlockAnim = 60;   // frames — drives the gold glow animation
        }
      });
    },

    onDrawVial(p, vial, x, y, vialW, vialH) {

      if (vial.unlockAnim > 0) {
        vial.unlockAnim--;
        const prog  = vial.unlockAnim / 60;
        const crack = 1 - prog;
        p.noFill();
        p.stroke(255, 200, 80, 200 * prog);
        p.strokeWeight(2 + crack * 4);
        p.drawingContext.shadowBlur  = 30 * prog;
        p.drawingContext.shadowColor = 'rgba(255,200,80,0.9)';
        p.rect(x - vialW/2 - 4, y - vialH/2 - 4, vialW + 8, vialH + 8, 12);
        p.drawingContext.shadowBlur = 0;
        return;
      }

      if (!vial.isLocked) return;

      p.noStroke();
      p.fill(20, 10, 45, 180);
      p.rect(x - vialW/2, y - vialH/2, vialW, vialH, 6, 6, 16, 16);

      const borderColorHex = window.LEVEL_DATA
        ? (LEVEL_DATA.COLORS[vial.lockColor] || '#a855f7')
        : '#a855f7';
      const borderCol = _hexToRgb(borderColorHex);
      const pulse     = 0.55 + 0.45 * Math.sin(Date.now() * 0.004);

      p.noFill();
      p.stroke(borderCol.r, borderCol.g, borderCol.b, 160 + pulse * 90);
      p.strokeWeight(2.5);
      p.drawingContext.shadowBlur  = 18 + pulse * 14;
      p.drawingContext.shadowColor =
        `rgba(${borderCol.r},${borderCol.g},${borderCol.b},0.75)`;
      p.rect(x - vialW/2 - 5, y - vialH/2 - 5, vialW + 10, vialH + 10, 14);
      p.drawingContext.shadowBlur = 0;

      p.noStroke();
      if (window.imgLock) {
        p.imageMode(p.CENTER);
        const imgRatio = window.imgLock.width / window.imgLock.height;
        const targetW  = vialW * 1.4;
        const targetH  = targetW / imgRatio;
        const imgPulse = 2 * Math.sin(Date.now() * 0.003);

        p.tint(borderCol.r, borderCol.g, borderCol.b, 255);
        p.image(window.imgLock, x, y - 10, targetW + imgPulse, targetH + imgPulse);
        p.noTint();
      } else {
        p.fill(borderCol.r, borderCol.g, borderCol.b, 220);
        p.textSize(22);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('\uD83D\uDD12', x, y - 10);
      }

      // ── Circle indicator (new mechanic, levels 11+) ──────────
      // Shows the color that must be sealed to unlock this vial.
      const levelId       = window.Game && Game.currentLevel ? Game.currentLevel.id : 0;
      const circleColor   = levelId >= 11 ? vial.lockCircleColor : null;

      if (circleColor) {
        const circleHex = window.LEVEL_DATA
          ? (LEVEL_DATA.COLORS[circleColor] || '#ffffff')
          : '#ffffff';
        const circleCol  = _hexToRgb(circleHex);
        const circlePulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.005 + 1.2);

        // Outer glow ring
        p.noFill();
        p.stroke(circleCol.r, circleCol.g, circleCol.b, 120 + circlePulse * 80);
        p.strokeWeight(1.5);
        p.drawingContext.shadowBlur  = 8 + circlePulse * 6;
        p.drawingContext.shadowColor =
          `rgba(${circleCol.r},${circleCol.g},${circleCol.b},0.8)`;
        p.circle(x, y + 18, 14);
        p.drawingContext.shadowBlur = 0;

        // Filled circle in the required color
        p.noStroke();
        p.fill(circleCol.r, circleCol.g, circleCol.b, 220);
        p.circle(x, y + 18, 10);
      } else {
        // Legacy: plain dot in lock color (levels < 11)
        p.fill(borderCol.r, borderCol.g, borderCol.b, 180);
        p.circle(x, y + 18, 10);
      }
    },

    onUpdate() {},
  },

  catalyst: {
    onLevelLoad(vials)           { gameMechanics.rune.onLevelLoad(vials); },
    onBeforePour(from, to)       { return gameMechanics.rune.onBeforePour(from, to); }, // inherits index-safe fix
    onAfterPour(f, t, all)       { gameMechanics.rune.onAfterPour(f, t, all); },
    onDrawVial(p, v, x, y, w, h) { gameMechanics.rune.onDrawVial(p, v, x, y, w, h); },
    onUpdate()                   {},
  },

  unstable: {
    _meter:        100,
    _displayMeter: 100,
    _lastTick:     0,
    _drain:        2,
    _started:      false,
    _failed:       false,

    onLevelLoad(vials) {
      const self = gameMechanics.unstable;
      const cfg  = window._currentLevelTimerConfig || {};
      
      self._meter        = 100;
      self._displayMeter = 100;
      self._drain        = cfg.drainPerSec || 2;
      self._lastTick     = Date.now();
      self._started      = false;
      self._failed       = false;
      
      _updateStabilityBar(100);
      _showStabilityBar(true);
    },

    onBeforePour(from, to) {
      const self = gameMechanics.unstable;
      if (!self._started) {
        self._started  = true;
        self._lastTick = Date.now();
      }
      return true;
    },

    onAfterPour(from, to, allVials) {
      const self = gameMechanics.unstable;
      if (to.layers.length === 4 && to.layers.every(c => c === to.layers[0])) {
        self._meter = Math.min(100, self._meter + 15);
      }
    },

    onDrawVial(p, vial, x, y, vialW, vialH) {
      const self = gameMechanics.unstable;
      if (self._displayMeter > 25) return;

      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      p.noFill();
      p.stroke(255, 60, 60, 120 + pulse * 130);
      p.strokeWeight(2);
      p.rect(x - vialW/2 - 3, y - vialH/2 - 3, vialW + 6, vialH + 6, 10);
    },

    onUpdate(vials) {
      const self = gameMechanics.unstable;

      if (!self._started || self._failed || !Game.currentLevel) return;

      const now      = Date.now();
      const deltaSec = (now - self._lastTick) / 1000;

      if (deltaSec > 0) {
        self._lastTick = now;
        self._meter    = Math.max(0, self._meter - self._drain * deltaSec);
      }

      self._displayMeter += (self._meter - self._displayMeter) * 0.1;
      _updateStabilityBar(self._displayMeter);

      if (self._meter <= 0 && !self._failed) {
        self._failed = true;
        console.log('[gameMechanics] Timer reached zero — triggering lose screen.');
        
        if (typeof window.cleanupLevelState === 'function') {
          window.cleanupLevelState();
        } else {
          _showStabilityBar(false);
        }
        
        if (window.GameBridge && window.GameBridge.triggerOutOfMoves) {
          window.GameBridge.triggerOutOfMoves();
        }
      }
    },

    reset() {
      const self = gameMechanics.unstable;
      self._meter        = 100;
      self._displayMeter = 100;
      self._started      = false;
      self._failed       = false;
      self._lastTick     = 0;
      _showStabilityBar(false);
    },
  },

  /* ══ HIDDEN LAYERS + TIMER (levels 21–25) ════════════════════
     Only the top layer is visible. Deeper layers are hidden. */
  combined: {
    _revealUsed:  0,
    _revealMax:   3,
    _revealState: {},

    onLevelLoad(vials) {
      const cfg = window._currentLevelHiddenConfig || {};
      this._hiddenBelow = cfg.hiddenBelow ?? 1;
      this._revealMax   = cfg.reveals     ?? 3;
      this._revealUsed  = 0;
      this._revealState = {};

      window._currentLevelTimerConfig = { drainPerSec: cfg.drainPerSec || 2 };
      gameMechanics.unstable.onLevelLoad(vials);

      vials.forEach(v => {
        v._hiddenBelow = this._hiddenBelow;
        v._revealed    = false;
      });

      _updateRevealCounter(this._revealMax - this._revealUsed);
      _showRevealCounter(true);
    },

    onBeforePour(from, to) {
      return gameMechanics.unstable.onBeforePour(from, to);
    },

    onAfterPour(from, to, allVials) {
      gameMechanics.unstable.onAfterPour(from, to, allVials);
      const idx = allVials.indexOf(from);
      if (idx >= 0) delete this._revealState[idx];
    },

    revealVial(vialIndex) {
      if (this._revealUsed >= this._revealMax) return false;
      this._revealUsed++;
      this._revealState[vialIndex] = 45;
      _updateRevealCounter(this._revealMax - this._revealUsed);
      return true;
    },

    onDrawVial(p, vial, x, y, vialW, vialH) {
      gameMechanics.unstable.onDrawVial(p, vial, x, y, vialW, vialH);

      const hiddenBelow = vial._hiddenBelow ?? 1;
      if (vial.layers.length <= 1) return;

      const allVials     = window.game ? window.game.vials : [];
      const vialIndex    = allVials.indexOf(vial);
      const revealFrames = this._revealState[vialIndex] || 0;

      if (revealFrames > 0) {
        this._revealState[vialIndex]--;
        if (this._revealState[vialIndex] <= 0) delete this._revealState[vialIndex];
        
        const revPulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.015);
        p.noFill();
        p.stroke(45, 212, 191, 160 + revPulse * 90);
        p.strokeWeight(2);
        p.drawingContext.shadowBlur  = 14;
        p.drawingContext.shadowColor = 'rgba(45,212,191,0.7)';
        p.rect(x - vialW/2 - 4, y - vialH/2 - 4, vialW + 8, vialH + 8, 12);
        p.drawingContext.shadowBlur = 0;
        return;
      }

      const LH          = vialH / 4;
      const hiddenCount = Math.min(hiddenBelow, vial.layers.length - 1);
      const coverH      = hiddenCount * LH;
      const coverY      = y + vialH/2 - coverH;

      p.noStroke();
      p.fill(10, 5, 25, 210);
      p.rect(x - vialW/2 + 2, coverY, vialW - 4, coverH, 0, 0, 8, 8);

      p.fill(80, 60, 120, 160);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('???', x, coverY + coverH / 2);
    },

    onUpdate(vials) {
      gameMechanics.unstable.onUpdate(vials);
    },
  },
// Leave your DOM HELPERS intact below this!
};

/* ══ DOM HELPERS — Stability Bar ═════════════════════════════ */
function _showStabilityBar(visible) {
  let bar = document.getElementById('stability-bar-wrap');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'stability-bar-wrap';

    if (!document.getElementById('stability-anim-style')) {
      const s = document.createElement('style');
      s.id = 'stability-anim-style';
      s.textContent = `
        #stability-bar-wrap {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 28px;
          z-index: 500;
          display: none;
          background: rgba(4, 2, 14, 0.92);
          border-top: 1px solid rgba(61, 42, 110, 0.6);
        }
        #stability-bar-track {
          position: absolute;
          inset: 0 0 0 56px;
          background: rgba(255, 255, 255, 0.05);
        }
        #stability-bar-fill {
          height: 100%;
          width: 100%;
          transform-origin: left;
          transform: scaleX(1);
          background: #66ff00;
          transition: transform 0.25s linear, background 0.5s ease;
          will-change: transform;
        }
        #stability-bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.18) 0%,
            transparent 55%,
            rgba(0,0,0,0.15) 100%);
          pointer-events: none;
        }
        #stability-bar-label {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          display: flex; align-items: center;
          padding: 0 12px;
          font-family: 'Cinzel Decorative', serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 0 6px rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.8);
          z-index: 2;
          pointer-events: none;
          white-space: nowrap;
          background: rgba(0,0,0,0.35);
          border-right: 1px solid rgba(255,255,255,0.12);
          min-width: 56px;
          justify-content: center;
        }
        @keyframes stability-danger {
          0%,100% { box-shadow: inset 0 0 0 2px rgba(239,68,68,0.5), 0 0 12px rgba(239,68,68,0.4); }
          50%      { box-shadow: inset 0 0 0 2px rgba(239,68,68,0.9), 0 0 28px rgba(239,68,68,0.7); }
        }
        #stability-bar-wrap.danger {
          animation: stability-danger 0.5s ease-in-out infinite;
        }
      `;
      document.head.appendChild(s);
    }

    bar.innerHTML = `
      <div id="stability-bar-track">
        <div id="stability-bar-fill"></div>
      </div>
      <div id="stability-bar-label">TIME</div>
    `;
    document.body.appendChild(bar);
  }
  bar.style.display = visible ? 'block' : 'none';
  if (!visible) bar.classList.remove('danger');
}

function _updateStabilityBar(pct) {
  const fill = document.getElementById('stability-bar-fill');
  const wrap = document.getElementById('stability-bar-wrap');
  if (!fill || !wrap) return;

  fill.style.transform = `scaleX(${pct / 100})`;

  if (pct > 60) {
    fill.style.background = '#66ff00';
    wrap.classList.remove('danger');
  } else if (pct > 35) {
    fill.style.background = '#ccff00';
    wrap.classList.remove('danger');
  } else if (pct > 15) {
    fill.style.background = '#ff9900';
    wrap.classList.remove('danger');
  } else {
    fill.style.background = '#ff2d2d';
    wrap.classList.add('danger');
  }
}

function _showRevealCounter(visible) {
  let el = document.getElementById('reveal-counter');
  if (!el) {
    el = document.createElement('div');
    el.id = 'reveal-counter';
    el.style.cssText = `
      position:fixed; top:200px; right:18px; z-index:999;
      background:rgba(10,6,22,.88);
      border:1px solid rgba(45,212,191,.35);
      border-radius:10px; padding:6px 14px; display:none;
      font-family:'Crimson Text',serif; font-size:13px;
      color:rgba(45,212,191,.9);
      box-shadow:0 4px 16px rgba(0,0,0,.55);
    `;
    el.innerHTML = `
      <span style="font-size:9px;letter-spacing:2px;text-transform:uppercase;
                   display:block;margin-bottom:2px;color:rgba(45,212,191,.55)"></span>
      <span id="reveal-count">3</span>
    `;
    document.body.appendChild(el);
  }
  el.style.display = visible ? 'block' : 'none';
}

function _updateRevealCounter(remaining) {
  const el = document.getElementById('reveal-count');
  if (el) el.textContent = remaining;
}

function _hexToRgb(hex) {
  hex = (hex || '#a855f7').replace('#', '');
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}


function getMechanic(name) {
  return gameMechanics[name] || gameMechanics.none;
}