class GameEngine {
  constructor() { this.reset(); }

  /* INIT  */
  loadLevel(levelId) {
    const levelDef = LEVEL_DATA.get(levelId);
    if (!levelDef) { console.error('[GameEngine] Level not found:', levelId); return; }

    this.currentLevel = levelDef;
    this.loader       = new LevelLoader(levelDef);
    const rawVials    = this.loader.buildVials(4);

    this.vials          = rawVials.map(v => new Vial(v));
    this.movesUsed      = 0;
    this.movesLimit     = levelDef.movesLimit;
    this.currentStars   = 3;
    this.selectedIdx    = -1;
    this.lastFromIdx    = -1;
    this.lastToIdx      = -1;
    this.lastPourCount  = 1;   
    this.undoStack      = [];
    this.undosRemaining = 5;   
    this.isComplete     = false;
    this.isOutOfMoves   = false;
    this.newlySealed    = [];  
  }

  reset() {
    this.currentLevel   = null;
    this.loader         = null;
    this.vials          = [];
    this.movesUsed      = 0;
    this.movesLimit     = 999;
    this.currentStars   = 3;
    this.selectedIdx    = -1;
    this.lastFromIdx    = -1;
    this.lastToIdx      = -1;
    this.lastPourCount  = 1;
    this.undoStack      = [];
    this.undosRemaining = 5;
    this.isComplete     = false;
    this.isOutOfMoves   = false;
    this.newlySealed    = [];
  }


  handleClick(index) {
    if (this.isComplete || this.isOutOfMoves) return 'none';

    if (this.selectedIdx === -1) {
      if (!this.vials[index].isEmpty) {
        this.selectedIdx = index;
        return 'selected';
      }
      return 'none';
    }

    if (this.selectedIdx === index) {
      this.selectedIdx = -1;
      return 'deselected';
    }

    const from = this.vials[this.selectedIdx];
    const to   = this.vials[index];

    if (to.canReceiveFrom(from)) {
      this.lastFromIdx = this.selectedIdx;
      this.lastToIdx   = index;

      const runLen  = from.topRunLength;
      const space   = to.maxLayers - to.layers.length;
      this.lastPourCount = Math.min(runLen, space);

      this.selectedIdx = -1;
      this._pushUndo();
      return 'poured';
    }

    this.selectedIdx = -1;
    return 'invalid';
  }

 
  commitPour() {
    const from  = this.vials[this.lastFromIdx];
    const to    = this.vials[this.lastToIdx];
    const count = this.lastPourCount || 1;
    let color;


    for (let i = 0; i < count; i++) {
      color = from.popLayer();
      to.pushLayer(color);
    }

    this.movesUsed++;
    this.currentStars = this.currentLevel.calculateStars(this.movesUsed);

    this.newlySealed = [];
    this.vials.forEach((v, i) => {
      if (v.isSolved && !v.isEmpty && !v._wasSealed) {
        v._wasSealed = true;
        this.newlySealed.push(i);
        GameState.addCoins(10);
      }
    });

    if (this._checkWin()) this.isComplete = true;

    if (!this.isComplete && this.movesUsed >= this.movesLimit) {
      this.isOutOfMoves = true;
    }

    return {
      color,
      count,
      stars:        this.currentStars,
      isComplete:   this.isComplete,
      isOutOfMoves: this.isOutOfMoves,
      newlySealed:  this.newlySealed,
    };
  }

  _pushUndo() {
    const snap = this.vials.map(v => v.snapshot());
    this.undoStack.push({ vials: snap, movesUsed: this.movesUsed });
    if (this.undoStack.length > 50) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    if (this.undosRemaining <= 0) return false;

    const snap = this.undoStack.pop();
    snap.vials.forEach((s, i) => {
      this.vials[i].restore(s);
      this.vials[i]._wasSealed = false; // un-seal on undo
    });
    this.movesUsed      = snap.movesUsed;
    this.currentStars   = this.currentLevel.calculateStars(this.movesUsed);
    this.isComplete     = false;
    this.isOutOfMoves   = false;
    this.undosRemaining--;
    return true;
  }

  addEmptyVial() {
    const v = new Vial({ layers: [], maxLayers: 4, mechanic: null });
    this.vials.push(v);
    return true;
  }

  _checkWin() {
    const hasContent = this.vials.some(v => !v.isEmpty);
    return hasContent && this.vials.every(v => v.isSolved);
  }

  get movesRemaining() { return Math.max(0, this.movesLimit - this.movesUsed); }

  getPositions(cw, ch, vialW, vialH, gap = 20) {
    if (!this.loader) return [];
    return this.loader.layoutPositions(this.vials.length, cw, ch, vialW, vialH, gap);
  }
}

const Game = new GameEngine();
window.Game = Game; 