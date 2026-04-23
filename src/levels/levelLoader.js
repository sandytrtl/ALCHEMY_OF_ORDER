
const LEVEL_DATA = (function () {

  const COLORS = {
    red:    '#ef4444',
    blue:   '#3b82f6',
    green:  '#22c55e',
    yellow: '#eab308',
    purple: '#a855f7',
    orange: '#f97316',
    teal:   '#14b8a6',
    pink:   '#ec4899',
    brown:  '#7c3f1e',
  };

  const levels = RAW_LEVEL_DATA.map(raw => new Level(raw));

  function get(id) {
    return levels.find(l => l.id === id);
  }

  function all() {
    return levels;
  }

  return { get, all, COLORS };
})();


class LevelLoader {
  constructor(level) {
    this.level = level;
    this.actualMoveCount = 0;
  }

  buildVials(layersPerVial = 4) {
    const { colors, filledVials, emptyVials, mechanic, expectedMoves } = this.level;

 
    if (this.level.layout) {
      const lockCfg = this.level.lockConfig;
      return this.level.layout.map((vial, i) => {
        let lockColor = null;
        if (lockCfg && lockCfg.lockedVials) {
          const lv = lockCfg.lockedVials.find(l => l.vialIndex === i);
          if (lv) lockColor = lv.lockColor;
        }
        return {
          layers:    vial.layers.slice(),
          maxLayers: layersPerVial,
          mechanic:  vial.mechanic || (i < filledVials ? this._assignMechanic(i, mechanic) : null),
          isLocked:  lockColor ? true : false,
          lockColor: lockColor,
        };
      });
    }

    const MAX_ATTEMPTS = 40;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {

      const vials = [];
      for (let i = 0; i < filledVials; i++) {
        vials.push({
          layers:    new Array(layersPerVial).fill(colors[i % colors.length]),
          maxLayers: layersPerVial,
        });
      }
      for (let i = 0; i < emptyVials; i++) {
        vials.push({ layers: [], maxLayers: layersPerVial });
      }

      const isSmall        = filledVials <= 2;
      const targetScramble = Math.max(expectedMoves * 3, colors.length * layersPerVial * 2);
      const maxSteps       = Math.min(targetScramble, 300);

      let lastFrom        = -1;
      let lastTo          = -1;
      let successfulMoves = 0;
      let stalledCount    = 0;

      for (let step = 0; step < maxSteps; step++) {
        let moves = this._findValidPours(
          vials, layersPerVial,
          isSmall ? -1 : lastFrom,
          isSmall ? -1 : lastTo
        );

        if (!isSmall && moves.length === 0) {
          moves = this._findValidPours(vials, layersPerVial, -1, -1);
        }

        if (moves.length === 0) {
          stalledCount++;
          if (stalledCount > 8) break;
          continue;
        }

        stalledCount = 0;
        const move = moves[Math.floor(Math.random() * moves.length)];
        const top  = vials[move.from].layers.pop();
        vials[move.to].layers.push(top);
        lastFrom = move.from;
        lastTo   = move.to;
        successfulMoves++;
      }

      if (successfulMoves >= 2 && !this._isSolved(vials, layersPerVial)) {
        const pureCount = vials.slice(0, filledVials).filter(v =>
          v.layers.length > 0 && v.layers.every(c => c === v.layers[0])
        ).length;

        if (pureCount === 0) {
          const built = vials.map((v, i) => ({
            layers:    v.layers,
            maxLayers: v.maxLayers,
            mechanic:  i < filledVials ? this._assignMechanic(i, mechanic) : null,
            isLocked:  false,
            lockColor: null,
          }));

          this._applyRuneLocks(built, mechanic, layersPerVial);
          return built;
        }
      }
    }

    return this._buildFallback(layersPerVial, colors, filledVials, emptyVials, mechanic);
  }

  _applyRuneLocks(built, mechanic, layersPerVial) {
    const lockCfg = this.level.lockConfig;
    if (mechanic !== 'rune' || !lockCfg || !lockCfg.lockedVials) return;

    const locksNeeded = lockCfg.lockedVials.length;

  
    const colorCounts = {};
    built.forEach(v => {
      v.layers.forEach(c => {
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      });
    });

   
    const validLockColors = Object.keys(colorCounts).filter(c => {
      if (colorCounts[c] !== layersPerVial) return false; // wrong count
      // Must not already be pure in one vial
      const alreadySolved = built.some(v =>
        v.layers.length === layersPerVial && v.layers.every(x => x === c)
      );
      return !alreadySolved;
    });

    if (validLockColors.length === 0) return; // nothing safe to lock with

    let locksApplied = 0;

    for (let li = 0; li < locksNeeded && li < validLockColors.length; li++) {
      const lc     = validLockColors[li];
      let applied  = 0;

   
      for (let i = 0; i < built.length && applied < 1; i++) {
        const v = built[i];
        if (v.layers.length === 0 || v.isLocked) continue;
        if (v.layers.every(c => c === v.layers[0])) continue; // skip pure
        if (v.layers.includes(lc)) continue; // no lock color inside

        v.isLocked  = true;
        v.lockColor = lc;
        applied++;
        locksApplied++;
      }

      
      if (applied < 1) {
        let bestIdx   = -1;
        let bestCount = Infinity;
        for (let i = 0; i < built.length; i++) {
          const v = built[i];
          if (v.layers.length === 0 || v.isLocked) continue;
          if (v.layers.every(c => c === v.layers[0])) continue;
          const lcCount = v.layers.filter(c => c === lc).length;
          if (lcCount < bestCount) { bestCount = lcCount; bestIdx = i; }
        }

        if (bestIdx !== -1) {
          const target = built[bestIdx];

          for (let li2 = 0; li2 < target.layers.length; li2++) {
            if (target.layers[li2] !== lc) continue;
            let swapped = false;
            for (let di = 0; di < built.length && !swapped; di++) {
              if (di === bestIdx || built[di].isLocked) continue;
              const donor = built[di];
              for (let dl = 0; dl < donor.layers.length && !swapped; dl++) {
                if (donor.layers[dl] === lc) continue;
                const tmp          = target.layers[li2];
                target.layers[li2] = donor.layers[dl];
                donor.layers[dl]   = tmp;
                swapped = true;
              }
            }
          }

          target.isLocked  = true;
          target.lockColor = lc;
          applied++;
          locksApplied++;
        }
      }
    }
  }


  _buildFallback(layersPerVial, colors, filledVials, emptyVials, mechanic) {
   
    const totalLayers = filledVials * layersPerVial;
    const pool = [];
    for (let i = 0; i < totalLayers; i++) {
      pool.push(colors[i % colors.length]);
    }

    
    for (let attempt = 0; attempt < 20; attempt++) {
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      // Slice into vials
      const vials = [];
      let poolCopy = pool.slice();
      let hasPure  = false;

      for (let i = 0; i < filledVials; i++) {
        const layers = poolCopy.splice(0, layersPerVial);
        if (layers.every(c => c === layers[0])) {
          hasPure = true;
          break;
        }
        vials.push({
          layers,
          maxLayers: layersPerVial,
          mechanic:  this._assignMechanic(i, mechanic),
          isLocked:  false,
          lockColor: null,
        });
      }

      if (hasPure) continue; // retry shuffle

      for (let i = 0; i < emptyVials; i++) {
        vials.push({ layers: [], maxLayers: layersPerVial, mechanic: null, isLocked: false, lockColor: null });
      }

      this._applyRuneLocks(vials, mechanic, layersPerVial);
      return vials;
    }

    // Last-resort: manually interleave colors so no vial is pure
    const vials = [];
    for (let i = 0; i < filledVials; i++) {
      const layers = [];
      for (let j = 0; j < layersPerVial; j++) {
        // Offset each slot so adjacent layers differ
        layers.push(colors[(i + j + 1) % colors.length]);
      }
      vials.push({
        layers,
        maxLayers: layersPerVial,
        mechanic:  this._assignMechanic(i, mechanic),
        isLocked:  false,
        lockColor: null,
      });
    }
    for (let i = 0; i < emptyVials; i++) {
      vials.push({ layers: [], maxLayers: layersPerVial, mechanic: null, isLocked: false, lockColor: null });
    }

    this._applyRuneLocks(vials, mechanic, layersPerVial);
    return vials;
  }

  
   
  _findValidPours(vials, layersPerVial, lastFrom, lastTo) {
    const moves = [];
    for (let f = 0; f < vials.length; f++) {
      if (vials[f].layers.length === 0) continue;
      const topColor = vials[f].layers[vials[f].layers.length - 1];

      for (let t = 0; t < vials.length; t++) {
        if (t === f) continue;
        if (lastFrom !== -1 && f === lastTo && t === lastFrom) continue;

        const dest = vials[t];
        if (dest.layers.length >= layersPerVial) continue;

        if (dest.layers.length === 0) {
          moves.push({ from: f, to: t });
        } else {
          const destTop = dest.layers[dest.layers.length - 1];
          if (destTop === topColor) moves.push({ from: f, to: t });
        }
      }
    }
    return moves;
  }

  _isSolved(vials, layersPerVial) {
    return vials.every(v =>
      v.layers.length === 0 ||
      (v.layers.length === layersPerVial && v.layers.every(c => c === v.layers[0]))
    );
  }

 
  layoutPositions(count, cw, ch, vialW, vialH, gap = 20) {
    const positions = [];

    if (count <= 6) {
      const total  = count * (vialW + gap) - gap;
      const startX = (cw - total) / 2 + vialW / 2;
      const midY   = ch / 2;
      for (let i = 0; i < count; i++) {
        positions.push({ x: startX + i * (vialW + gap), y: midY });
      }
    } else {
      const perRow  = Math.ceil(count / 2);
      const rowGap  = vialH + 30;
      const topY    = ch / 2 - rowGap / 2;
      const bottomY = ch / 2 + rowGap / 2;

      for (let i = 0; i < count; i++) {
        const row      = i < perRow ? 0 : 1;
        const col      = i % perRow;
        const rowCount = row === 0 ? perRow : count - perRow;
        const rowW     = rowCount * (vialW + gap) - gap;
        const startX   = (cw - rowW) / 2 + vialW / 2;
        positions.push({
          x: startX + col * (vialW + gap),
          y: row === 0 ? topY : bottomY,
        });
      }
    }

    return positions;
  }

  /**
   * Assign a mechanic tag to a vial by index.
   * @private
   */
  _assignMechanic(index, mechanic) {
    if (mechanic === 'none' || mechanic === null) return null;
    if (mechanic === 'combined') {
      return index % 2 === 0 ? 'rune' : 'unstable';
    }
    return index % 2 === 0 ? mechanic : null;
  }
}