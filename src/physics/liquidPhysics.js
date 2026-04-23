
class LiquidPour {
  /**
   * @param {object} fromPos  {x, y}  - source vial screen position
   * @param {object} toPos    {x, y}  - destination vial screen position
   * @param {string} color            - potion color name
   * @param {number} [speed=0.035]    - animation progress per frame (0–1)
   */
  constructor(fromPos, toPos, color, speed = 0.035) {
    this.fromPos = fromPos;
    this.toPos   = toPos;
    this.color   = color;
    this.speed   = speed;

    this.t       = 0;     // animation progress 0 → 1
    this.done    = false;

    this._cx = (fromPos.x + toPos.x) / 2;
    this._cy = Math.min(fromPos.y, toPos.y) - 70;

    this.particles = [];
  }

  update() {
    this.t += this.speed;
    if (this.t >= 1) {
      this.t    = 1;
      this.done = true;
    }
    this._spawnDrip();
    this._updateParticles();
  }


  /**
   * 
   * @param {object} p      - p5 instance
   * @param {number} vialW  - vial width
   * @param {number} vialH  - vial height
   * @param {number} layerH - height of one potion layer
   */
  draw(p, vialW, vialH, layerH) {
    const rgb = getColorRGB(this.color);

    const sx = this.fromPos.x;
    const sy = this.fromPos.y - vialH / 2 - 12;
    const ex = this.toPos.x;
    const ey = this.toPos.y - vialH / 2 + layerH * 0.5;

    p.noFill();
    p.stroke(rgb[0], rgb[1], rgb[2], 210);
    p.strokeWeight(9);
    p.drawingContext.shadowBlur  = 14;
    p.drawingContext.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`;

    p.beginShape();
    const steps = Math.max(20, Math.floor(this.t * 40));
    for (let i = 0; i <= steps; i++) {
      const ti = (i / steps) * this.t;
      const bx = p.bezierPoint(sx, this._cx, this._cx, ex, ti);
      const by = p.bezierPoint(sy, this._cy, this._cy, ey, ti);
      p.vertex(bx, by);
    }
    p.endShape();

    p.drawingContext.shadowBlur = 0;

    const tipX = p.bezierPoint(sx, this._cx, this._cx, ex, this.t);
    const tipY = p.bezierPoint(sy, this._cy, this._cy, ey, this.t);

    p.noStroke();
    p.fill(rgb[0], rgb[1], rgb[2], 240);
    p.drawingContext.shadowBlur  = 8;
    p.drawingContext.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.7)`;
    p.ellipse(tipX, tipY, 13, 16);
    p.drawingContext.shadowBlur = 0;

    this._drawParticles(p, rgb);
  }


  _spawnDrip() {
    if (Math.random() > 0.35) return;
    const tipT = this.t;
    this.particles.push({
      x:     0, y: 0, // set in draw relative to tip
      tipT,
      vx:    (Math.random() - 0.5) * 1.5,
      vy:    Math.random() * -1.5,
      size:  Math.random() * 4 + 2,
      life:  1,
      decay: Math.random() * 0.04 + 0.02,
    });
  }

  _updateParticles() {
    this.particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.15;   // gravity
      p.life -= p.decay;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  _drawParticles(p, rgb) {
    this.particles.forEach(drip => {
      p.noStroke();
      p.fill(rgb[0], rgb[1], rgb[2], drip.life * 180);
      // Drips spread around the tip position (stored as offset)
      const bx = p.bezierPoint(
        this.fromPos.x, this._cx, this._cx, this.toPos.x, drip.tipT
      );
      const by = p.bezierPoint(
        this.fromPos.y - 100, this._cy, this._cy, this.toPos.y - 80, drip.tipT
      );
      p.ellipse(bx + drip.x, by + drip.y, drip.size);
    });
  }
}



class LiquidFill {
  /**
   * @param {string} color         - potion color name
   * @param {number} targetLayerY  - y-coordinate where the new layer should sit
   * @param {number} [speed=0.06]
   */
  constructor(color, targetLayerY, speed = 0.06) {
    this.color        = color;
    this.targetLayerY = targetLayerY;
    this.progress     = 0;
    this.speed        = speed;
    this.done         = false;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 1;
      this.done     = true;
    }
  }

  
  currentY(layerH) {
    const startY = this.targetLayerY - layerH * 0.5;
    return startY + (this.targetLayerY - startY) * this._easeOut(this.progress);
  }

  _easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}