const Mechanics = {
  none: {
    onLevelLoad()       {},
    onBeforePour()      { return true; },
    onAfterPour()       {},
    onDrawVial()        {},
    onUpdate()          {},
  },

  // Vial labels fade out after a short delay, testing player memory.
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

    onBeforePour(from, to) { return true; },
    onAfterPour(from, to)  {},

    onDrawVial(p, vial, x, y, vialW, vialH) {
      if (vial.mechanic !== 'fading') return;
      const alpha = 255 * (1 - vial.fadingProgress); 
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

  // Certain vials are locked and can only be unlocked by a catalyst pour.
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
    if (from.isLocked || to.isLocked) return false;
    return true;
  },

  // Unlock by color-key: complete a full same-color vial to unlock
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

  // Certain potions are unstable: after being poured they trigger
  unstable: {
    onLevelLoad(vials) {
      vials.forEach(v => {
        if (v.mechanic === 'unstable' && !v.isEmpty) {
          v.isUnstable = true;
        }
      });
    },

    onBeforePour(from, to) { return true; },

reset() {
  const self = gameMechanics.unstable;
  self._started = false;
  self._failed = false;
  self._meter = 100;
  self._displayMeter = 100;
},

    onAfterPour(from, to, allVials) {
      if (!to.isUnstable) return;
      const candidates = allVials.filter(v => v !== to && !v.isEmpty && !v.isFull);
      if (candidates.length === 0) return;
      const target  = candidates[Math.floor(Math.random() * candidates.length)];
      const topA    = to.popLayer();
      const topB    = target.popLayer();
      if (topA) target.pushLayer(topA);
      if (topB) to.pushLayer(topB);
    },

   onDrawVial(p, vial, x, y, vialW, vialH) {
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

      p.noStroke();
      p.fill(15, 10, 30, 150);
      p.rect(x - vialW/2, y - vialH/2, vialW, vialH, 6, 6, 16, 16);

      if (window.imgLock) {
        p.imageMode(p.CENTER);
        
        const imgRatio = window.imgLock.width / window.imgLock.height;
        const targetW = vialW * 1.4; 
        const targetH = targetW / imgRatio;

        const pulse = 2 * Math.sin(Date.now() * 0.003);
        
        const lockCol = _hexToRgb(
          window.LEVEL_DATA ? (LEVEL_DATA.COLORS[vial.lockColor] || '#a855f7') : '#a855f7'
        );
        
        p.tint(lockCol.r, lockCol.g, lockCol.b, 255); 
        p.image(window.imgLock, x, y, targetW + pulse, targetH + pulse);
        p.noTint(); 
      } else {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('LOCKED', x, y);
      }
    },

    onUpdate() {},
  },
  

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
 * 
 * @param  {string} name
 * @returns {object} mechanic handler
 */
function getMechanic(name) {
  return Mechanics[name] || Mechanics.none;
}
