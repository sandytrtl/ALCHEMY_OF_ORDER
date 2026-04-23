

class Character {
  /**
   * @param {object} [options]
   * @param {number}  options.floatAmplitude 
   * @param {number}  options.floatSpeed     
   */
  constructor({ floatAmplitude = 12, floatSpeed = 0.03 } = {}) {
    this.state          = 'idle';   
    this.floatAmplitude = floatAmplitude;
    this.floatSpeed     = floatSpeed;
    this._phase         = 0;
    // Rejection shake
    this._shakeFrames   = 0;
    this._shakeOffset   = 0;

    this._stateTimer    = 0;
  }

  celebrate() {
    this.state       = 'happy';
    this._stateTimer = 120; // frames
  }
  reject() {
    this.state        = 'reject';
    this._shakeFrames = 20;
    this._stateTimer  = 20;
  }
  idle() {
    this.state = 'idle';
  }

  update() {
    this._phase += this.floatSpeed;

    if (this._stateTimer > 0) {
      this._stateTimer--;
      if (this._stateTimer === 0 && this.state !== 'idle') {
        this.state = 'idle';
      }
    }

    // Shake offset
    if (this._shakeFrames > 0) {
      this._shakeOffset = Math.sin(this._shakeFrames * 1.2) * 6;
      this._shakeFrames--;
    } else {
      this._shakeOffset = 0;
    }
  }

  /* ── COMPUTED VALUES ───────────────────────────────────────── */

  /**
   * Current vertical offset for float animation.
   * @returns {number} px offset (negative = up)
   */
  get floatY() {
    return Math.sin(this._phase) * this.floatAmplitude;
  }

  /**
   * Current horizontal offset (rejection shake).
   * @returns {number}
   */
  get shakeX() {
    return this._shakeOffset;
  }

  /**
   * Emoji or image key for the current state.
   * Useful if drawing the witch on the canvas.
   */
  get currentEmoji() {
    switch (this.state) {
      case 'happy':  return '🧙‍♀️'; // replace with happy image key
      case 'reject': return '🧙‍♀️'; // replace with reject image key
      default:       return '🧙‍♀️'; // idle
    }
  }

  /**
   * Draw the witch character on the p5 canvas.
   * Call this if you want the witch rendered inside the gameplay canvas.
   * Typically only used for the win/intro overlay.
   *
   * @param {object} p    - p5 instance
   * @param {number} x    - center x
   * @param {number} y    - center y (before float offset)
   * @param {object} [imgs] - { idle, happy, reject } p5.Image objects
   */
  draw(p, x, y, imgs = null) {
    const drawX = x + this.shakeX;
    const drawY = y + this.floatY;

    if (imgs && imgs[this.state]) {
      // Draw loaded image
      const img = imgs[this.state];
      p.imageMode(p.CENTER);
      p.image(img, drawX, drawY, 120, 150);
    } else {
      // Fallback: emoji text
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(80);
      p.text(this.currentEmoji, drawX, drawY);
    }
  }
}

// Singleton — one witch per game
const Witch = new Character();