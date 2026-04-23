

class ParticleSystem {
  constructor() {
    this.particles = [];
  }


  /**
   * Emit a splash burst when liquid lands in a vial.
   * @param {number} x      - landing x position
   * @param {number} y      - landing y position
   * @param {string} color  - potion color name
   * @param {number} [count=12]
   */
  splash(x, y, color, count = 12) {
    const rgb = getColorRGB(color);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        type:  'splash',
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 2,
        size:  Math.random() * 5 + 2,
        rgb,
        life:  1,
        decay: Math.random() * 0.06 + 0.03,
      });
    }
  }

  /**
   * Emit rising bubble particles inside a vial.
   * @param {number} x      - vial center x
   * @param {number} y      - vial bottom y
   * @param {string} color  - potion color name
   * @param {number} [count=5]
   */
  bubbles(x, y, color, count = 5) {
    const rgb = getColorRGB(color);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type:  'bubble',
        x:     x + (Math.random() - 0.5) * 30,
        y,
        vx:    (Math.random() - 0.5) * 0.5,
        vy:    -(Math.random() * 1.5 + 0.5),
        size:  Math.random() * 6 + 3,
        rgb,
        life:  1,
        decay: Math.random() * 0.02 + 0.01,
      });
    }
  }

  /**
   * Emit a single drip from the vial rim (cosmetic only).
   * @param {number} x
   * @param {number} y
   * @param {string} color
   */
  drip(x, y, color) {
    const rgb = getColorRGB(color);
    this.particles.push({
      type:  'drip',
      x, y,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    Math.random() * 0.5 + 0.2,
      size:  Math.random() * 4 + 2,
      rgb,
      life:  1,
      decay: 0.025,
    });
  }


  update() {
    this.particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.decay;

      if (p.type === 'splash') {
        p.vy += 0.2;     // gravity
        p.vx *= 0.95;    // air resistance
      }
      if (p.type === 'bubble') {
        p.size -= 0.05;  // shrink as they rise
      }
    });

    this.particles = this.particles.filter(p => p.life > 0 && p.size > 0.3);
  }


  /**
   * Render all active particles.
   * @param {object} p - p5 instance
   */
  draw(p) {
    this.particles.forEach(particle => {
      const { rgb, life, size, x, y, type } = particle;

      p.noStroke();

      if (type === 'bubble') {
        // Bubble: outlined circle
        p.noFill();
        p.stroke(rgb[0], rgb[1], rgb[2], life * 160);
        p.strokeWeight(1);
        p.ellipse(x, y, size);
      } else {
        // Splash / drip: filled circle with glow
        p.fill(rgb[0], rgb[1], rgb[2], life * 220);
        p.drawingContext.shadowBlur  = 4;
        p.drawingContext.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`;
        p.ellipse(x, y, size);
        p.drawingContext.shadowBlur  = 0;
      }
    });
  }

  /** Remove all particles instantly. */
  clear() {
    this.particles = [];
  }
}