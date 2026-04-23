/* ================================================================
   mechanics.js — Special level mechanic handlers
   Alchemy of Order

   Each mechanic is a set of hooks the GameEngine calls during play:
     onLevelLoad(vials)         — set up initial state
     onBeforePour(from, to)     — return false to block the pour
     onAfterPour(from, to)      — trigger side effects
     onDrawVial(p, vial, x, y)  — overlay decorations (called by ui.js)
     onUpdate(vials)            — per-frame logic (timers, etc.)
================================================================ */

const Mechanics = {

  /* ── NONE ──────────────────────────────────────────────────── */
  none: {
    onLevelLoad()       {},
    onBeforePour()      { return true; },
    onAfterPour()       {},
    onDrawVial()        {},
    onUpdate()          {},
  },

  /* ── FADING VIALS ──────────────────────────────────────────── */
  // Vial labels fade out after a short delay, testing player memory.
  fading: {
    VISIBLE_MS: 3000,   // ms before fading begins
    FADE_MS:    2000,   // ms to fully fade out

    onLevelLoad(vials) {
      vials.forEach(v => {
        if (v.mechanic === 'fading') {
          v.fadingTimer    = Date.now();
          v.fadingProgress = 1; // fully visible
        }
      });
    },

    onBeforePour(from, to) { return true; },
    onAfterPour(from, to)  {},

    /** Draw a translucent overlay over faded vials. */
    onDrawVial(p, vial, x, y, vialW, vialH) {
      if (vial.mechanic !== 'fading') return;
      const alpha = 255 * (1 - vial.fadingProgress); // 0 = visible, 255 = hidden
      if (alpha <= 0) return;
      p.noStroke();
      p.fill(15, 10, 30, alpha);
      p.rect(x - vialW / 2, y - vialH / 2, vialW, vialH, 6, 6, 16, 16);

      // Draw "?" when fully faded
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
        if (v.mechanic !== 'fading' || v.fadingTimer === null) return;
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

  /* ── RUNE-LOCKED ───────────────────────────────────────────── */
  // Certain vials are locked and can only be unlocked by a catalyst pour.
 rune: {
  onLevelLoad(vials) {
    // Lock by lockColor (set by LevelLoader), not by mechanic tag —
    // LevelLoader only sets mechanic on even-indexed vials but sets
    // lockColor on any vial that should be locked.
    vials.forEach(v => {
      if (v.lockColor) {
        v.isLocked   = true;
        v.unlockAnim = 0;
      }
    });
  },

  onBeforePour(from, to) {
    if (from.isLocked || to.isLocked) return false;
    return true;
  },

  // Unlock by color-key: complete a full same-color vial to unlock
  // all vials whose lockColor matches that completed color.
  onAfterPour(from, to, allVials) {
    allVials.forEach(v => {
      if (v.layers.length === 4 && v.layers.every(c => c === v.layers[0])) {
        const solvedColor = v.layers[0];
        allVials.forEach(lv => {
          if (lv.isLocked && lv.lockColor === solvedColor) {
            lv.isLocked   = false;
            lv.unlockAnim = 60;
          }
        });
      }
    });
  },

  onDrawVial(p, vial, x, y, vialW, vialH) {
    if (!vial.isLocked) return;
    p.noStroke();
    p.fill(30, 15, 60, 160);
    p.rect(x - vialW / 2, y - vialH / 2, vialW, vialH, 6, 6, 16, 16);
    p.fill(168, 85, 247, 220);
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🔒', x, y);
  },

  onUpdate() {},
},

  /* ── UNSTABLE ──────────────────────────────────────────────── */
  // Certain potions are unstable: after being poured they trigger
  // a forced random shuffle of a random vial's top layer.
  unstable: {
    onLevelLoad(vials) {
      vials.forEach(v => {
        if (v.mechanic === 'unstable' && !v.isEmpty) {
          v.isUnstable = true;
        }
      });
    },

    onBeforePour(from, to) { return true; },

    /* Inside mechanics.js -> unstable: { ... } */
reset() {
  const self = gameMechanics.unstable;
  self._started = false;
  self._failed = false;
  self._meter = 100;
  self._displayMeter = 100;
  // This ensures that even if onUpdate runs one last time, it does nothing
},

    onAfterPour(from, to, allVials) {
      if (!to.isUnstable) return;
      // Swap the top layer of 'to' with a random non-empty vial
      const candidates = allVials.filter(v => v !== to && !v.isEmpty && !v.isFull);
      if (candidates.length === 0) return;
      const target  = candidates[Math.floor(Math.random() * candidates.length)];
      const topA    = to.popLayer();
      const topB    = target.popLayer();
      if (topA) target.pushLayer(topA);
      if (topB) to.pushLayer(topB);
    },

   onDrawVial(p, vial, x, y, vialW, vialH) {
      // 1. Handle Unlocking Animation (The Glow)
      if (vial.unlockAnim > 0) {
        vial.unlockAnim--;
        const prog = vial.unlockAnim / 60;
        p.drawingContext.shadowBlur = 40 * prog;
        p.drawingContext.shadowColor = 'rgba(255, 215, 0, 0.8)';
        p.noFill();
        p.stroke(255, 215, 0, 200 * prog);
        p.rect(x - vialW/2 - 4, y - vialH/2 - 4, vialW + 8, vialH + 8, 12);
        p.drawingContext.shadowBlur = 0;
        return;
      }

      if (!vial.isLocked) return;

      // 2. Darken the vial slightly
      p.noStroke();
      p.fill(15, 10, 30, 150);
      p.rect(x - vialW/2, y - vialH/2, vialW, vialH, 6, 6, 16, 16);

      // 3. Draw your custom lock image
      if (window.imgLock) {
        p.imageMode(p.CENTER);
        
        // Calculate size (slightly wider than vial to show the chains)
        const imgRatio = window.imgLock.width / window.imgLock.height;
        const targetW = vialW * 1.4; 
        const targetH = targetW / imgRatio;

        // Subtle hover pulse
        const pulse = 2 * Math.sin(Date.now() * 0.003);
        
        // Apply a color tint based on the lockColor (Optional)
        const lockCol = _hexToRgb(
          window.LEVEL_DATA ? (LEVEL_DATA.COLORS[vial.lockColor] || '#a855f7') : '#a855f7'
        );
        
        // Use tint to make the rune glow slightly in the key color
        p.tint(lockCol.r, lockCol.g, lockCol.b, 255); 
        p.image(window.imgLock, x, y, targetW + pulse, targetH + pulse);
        p.noTint(); 
      } else {
        // Fallback if image fails to load
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('LOCKED', x, y);
      }
    },

    onUpdate() {},
  },
  

  /* ── COMBINED ──────────────────────────────────────────────── */
  // Applies both rune and unstable mechanics simultaneously.
  combined: {
    onLevelLoad(vials) {
      Mechanics.rune.onLevelLoad(vials);
      Mechanics.unstable.onLevelLoad(vials);
    },
    onBeforePour(from, to, allVials) {
      return Mechanics.rune.onBeforePour(from, to, allVials)
          && Mechanics.unstable.onBeforePour(from, to, allVials);
    },
    onAfterPour(from, to, allVials) {
      Mechanics.rune.onAfterPour(from, to, allVials);
      Mechanics.unstable.onAfterPour(from, to, allVials);
    },
    onDrawVial(p, vial, x, y, vialW, vialH) {
      Mechanics.rune.onDrawVial(p, vial, x, y, vialW, vialH);
      Mechanics.unstable.onDrawVial(p, vial, x, y, vialW, vialH);
    },
    onUpdate(vials) {
      Mechanics.unstable.onUpdate(vials);
    },
  },
};

/**
 * Get the mechanic handler for a given mechanic string.
 * @param  {string} name
 * @returns {object} mechanic handler
 */
function getMechanic(name) {
  return Mechanics[name] || Mechanics.none;
}
