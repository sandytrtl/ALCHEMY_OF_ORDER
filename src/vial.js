
class Vial {
  /**
   * @param {object} config
   * @param {string[]} config.layers     - initial potion color stack (bottom → top)
   * @param {number}   config.maxLayers   - capacity (typically 4)
   * @param {string|null} config.mechanic - 'fading'|'rune'|'catalyst'|'unstable'|null
   */
  constructor({ layers = [], maxLayers = 4, mechanic = null, isLocked = false } = {}) {
    // Ensure we don't exceed capacity on initialization
    this.layers      = [...layers].slice(0, maxLayers);
    this.maxLayers   = maxLayers;
    this.mechanic    = mechanic;
    this.isLocked    = isLocked;

    // Fading mechanic state
    this.fadingTimer     = null;
    this.fadingProgress  = 1; // 1 = fully visible, 0 = hidden

    // Visual state
    this.shakeOffset = 0;   // x-offset for invalid-move shake animation
  }


  get isEmpty()   { return this.layers.length === 0; }
  get isFull()    { return this.layers.length >= this.maxLayers; }
  get topColor()  { return this.isEmpty ? null : this.layers[this.layers.length - 1]; }
  
  /**
  
   * @param {number} baseY - The screen Y coordinate of the vial bottom.
   * @param {number} layerH - The height of a single potion layer.
   * @returns {number}
   */
  getLayerY(index, baseY, layerH) {
    // index 0 is at the bottom. 
    // We subtract (index + 0.5) * layerH to center the block vertically.
    return baseY - (index + 0.5) * layerH;
  }

  get isSolved()  {
    if (this.isEmpty) return true;
    return this.layers.length === this.maxLayers
        && this.layers.every(c => c === this.layers[0]);
  }

  /**
   * Check if the top layer of another vial can be poured into this one.
   * @param {Vial} fromVial
   * @returns {boolean}
   */
  canReceiveFrom(fromVial) {
    if (fromVial.isEmpty)    return false;
    if (this.isFull)         return false;
    if (this.isLocked)       return false;
    if (this.isEmpty)        return true;
    return this.topColor === fromVial.topColor;
  }


  /**
   * Remove and return the top layer.
   * @returns {string|null} color name, or null if empty
   */
  popLayer() {
    return this.isEmpty ? null : this.layers.pop();
  }

  /**
   * Push a color layer onto the top.
   * @param {string} color
   * @returns {boolean} success
   */
  pushLayer(color) {
    if (this.isFull) return false;
    this.layers.push(color);
    return true;
  }

  /**
   * Count how many consecutive matching layers are on top.
   */
  get topRunLength() {
    if (this.isEmpty) return 0;
    const top = this.topColor;
    let count = 0;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      if (this.layers[i] === top) count++;
      else break;
    }
    return count;
  }


  /** Return a plain-object snapshot for undo/redo. */
  snapshot() {
    return {
      layers:    [...this.layers],
      isLocked:  this.isLocked,
      mechanic:  this.mechanic,
    };
  }

  /** Restore from a snapshot object. */
  restore(snap) {
    this.layers   = [...snap.layers];
    this.isLocked = snap.isLocked;
    this.mechanic = snap.mechanic;
  }
}