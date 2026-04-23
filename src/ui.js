const VialRenderer = {

  VIAL_W:  72,
  VIAL_H:  200,
  LAYER_H: 44,

  draw(p, vial, x, y, selected = false, mechanic = null) {
    const { VIAL_W, VIAL_H, LAYER_H } = this;
    const top    = y - VIAL_H / 2;
    const solved = vial.isSolved && !vial.isEmpty;

    this._drawAltarGlow(p, vial, x, y + VIAL_H / 2, VIAL_W, solved);

    if (selected) {
      const pulse = 4 + Math.sin(p.frameCount * 0.09) * 3;
      p.noFill();
      p.drawingContext.shadowBlur  = 28 + pulse * 2;
      p.drawingContext.shadowColor = 'rgba(249,196,80,0.75)';
      p.stroke(249, 196, 80, 100);
      p.strokeWeight(1.5);
      p.rect(x - VIAL_W/2 - 8, top - 8, VIAL_W + 16, VIAL_H + 16, 18);
      p.drawingContext.shadowBlur = 0;
      p.stroke(249, 196, 80, 210);
      p.strokeWeight(2);
      p.rect(x - VIAL_W/2 - 4, top - 4, VIAL_W + 8, VIAL_H + 8, 14);
      p.noStroke();
    }

    if (solved) {
      p.drawingContext.shadowBlur  = 35;
      p.drawingContext.shadowColor = 'rgba(34,197,94,0.45)';
    }

    p.noStroke();
    p.fill(8, 4, 20, 215);
    p.rect(x - VIAL_W/2, top, VIAL_W, VIAL_H, 8, 8, 22, 22);
    p.drawingContext.shadowBlur = 0;

    p.fill(20, 12, 42, 70);
    p.rect(x - VIAL_W/2 + 2, top + 2, VIAL_W - 4, VIAL_H - 4, 6, 6, 20, 20);

    this._drawLayers(p, vial, x, top);

    p.noFill();
    if (solved) {
      p.stroke(60, 200, 100, 200);
      p.strokeWeight(2);
    } else {
      p.stroke(90, 60, 150, 175);
      p.strokeWeight(1.5);
    }
    p.rect(x - VIAL_W/2, top, VIAL_W, VIAL_H, 8, 8, 22, 22);

    p.noStroke();
    p.fill(255, 255, 255, 20);
    p.rect(x - VIAL_W/2 + 4, top + 12, 10, VIAL_H - 44, 5);

    if (!solved) {
      p.fill(12, 6, 28, 240);
      p.noStroke();
      p.rect(x - VIAL_W/2 - 3, top - 7, VIAL_W + 6, 15, 4);
      p.stroke(140, 90, 200, 70);
      p.strokeWeight(1);
      p.noFill();
      p.rect(x - VIAL_W/2 - 3, top - 7, VIAL_W + 6, 15, 4);
      p.noStroke();
      p.fill(255, 255, 255, 12);
      p.rect(x - VIAL_W/2 + 2, top - 5, VIAL_W - 4, 5, 2);
    }

    if (solved) this._drawLid(p, vial, x, top);

    if (!solved) {
      p.fill(120, 100, 150, 100);
      p.noStroke();
      p.textSize(9);
      p.textAlign(p.CENTER, p.TOP);
      p.text(`${vial.layers.length}/${vial.maxLayers}`, x, top + VIAL_H + 7);
    }

    if (mechanic?.onDrawVial) {
      mechanic.onDrawVial(p, vial, x, y, VIAL_W, VIAL_H);
    }
  },

  _drawAltarGlow(p, vial, cx, baseY, vialW, solved) {
    if (!isFinite(cx) || !isFinite(baseY) || !isFinite(vialW) || vialW <= 0) return;
    let r = 80, g = 40, b = 180;
    // Safe: check vial and topColor exist before accessing
    if (vial && vial.topColor) {
      const rgb = getColorRGB(vial.topColor);
      if (rgb) { r = rgb[0]; g = rgb[1]; b = rgb[2]; }
    }
    const alpha = solved ? 55 : 22;
    p.noStroke();
    p.fill(r, g, b, alpha);
    p.drawingContext.shadowBlur  = 38;
    p.drawingContext.shadowColor = `rgba(${r},${g},${b},0.28)`;
    p.ellipse(cx, baseY + 10, vialW * 1.9, 14);
    p.drawingContext.shadowBlur = 0;
  },

  _drawLid(p, vial, x, top) {
    const { VIAL_W } = this;
    const rgb = getColorRGB(vial.layers[0]) || [150, 150, 150];

    // Cork shadow
    p.fill(0, 0, 0, 55);
    p.noStroke();
    p.ellipse(x, top - 1, VIAL_W - 6, 8);

    // Cork body
    p.fill(185, 148, 88);
    p.rect(x - VIAL_W/2 + 9, top - 22, VIAL_W - 18, 26, 5, 5, 2, 2);

    // Cork grain
    p.stroke(138, 100, 52, 75);
    p.strokeWeight(1);
    for (let gi = 0; gi < 3; gi++) {
      p.line(x - VIAL_W/2 + 14 + gi * 10, top - 21,
             x - VIAL_W/2 + 14 + gi * 10, top + 2);
    }
    p.noStroke();

    // Cork cap
    p.fill(148, 108, 55);
    p.rect(x - VIAL_W/2 + 13, top - 28, VIAL_W - 26, 10, 4);

    // Wax seal glow
    p.drawingContext.shadowBlur  = 16;
    p.drawingContext.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.90)`;
    p.fill(rgb[0], rgb[1], rgb[2], 230);
    p.circle(x, top - 17, 18);
    p.drawingContext.shadowBlur = 0;

    // Wax seal ring
    p.noFill();
    p.stroke(Math.max(0, rgb[0]-50), Math.max(0, rgb[1]-50), Math.max(0, rgb[2]-50), 160);
    p.strokeWeight(1);
    p.circle(x, top - 17, 18);
    p.noStroke();

    // Wax highlight
    p.fill(255, 255, 255, 55);
    p.circle(x - 3, top - 20, 6);

    // Sealed label
    p.fill(34, 220, 100, 200);
    p.textSize(11);
    p.textAlign(p.CENTER, p.TOP);
    p.text('✓ sealed', x, top + this.VIAL_H + 6);
  },

  _drawLayers(p, vial, x, top) {
    const { VIAL_W, VIAL_H, LAYER_H } = this;
    if (!vial.layers || vial.layers.length === 0) return;

    const filledH  = vial.layers.length * LAYER_H;
    const layerTop = top + VIAL_H - filledH;

    // Clip to inner glass
    const ctx = p.drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x - VIAL_W/2 + 2, top + 2, VIAL_W - 4, VIAL_H - 4, [6, 6, 20, 20]);
    ctx.clip();

    vial.layers.forEach((colorName, i) => {
      const rgb   = getColorRGB(colorName) || [150, 150, 150];
      const alpha = (vial.fadingProgress !== undefined)
                    ? Math.floor(vial.fadingProgress * 235) : 235;
      const ly    = layerTop + (vial.layers.length - 1 - i) * LAYER_H;
      const isTop = (i === vial.layers.length - 1);

      // Main liquid fill
      p.noStroke();
      p.fill(rgb[0], rgb[1], rgb[2], alpha);
      p.rect(x - VIAL_W/2 + 2, ly, VIAL_W - 4, LAYER_H + 1);

      // Top meniscus highlight
      if (isTop) {
        p.fill(
          Math.min(rgb[0] + 45, 255),
          Math.min(rgb[1] + 45, 255),
          Math.min(rgb[2] + 45, 255), 55);
        p.rect(x - VIAL_W/2 + 2, ly, VIAL_W - 4, 5, 2, 2, 0, 0);
      }

      // Inner brightness
      p.fill(
        Math.min(rgb[0] + 60, 255),
        Math.min(rgb[1] + 60, 255),
        Math.min(rgb[2] + 60, 255), 32);
      p.rect(x - VIAL_W/2 + 4, ly + 4, VIAL_W - 8, LAYER_H - 8);

      // Left refraction streak
      p.fill(255, 255, 255, 36);
      p.rect(x - VIAL_W/2 + 6, ly + 7, 7, LAYER_H - 14, 3);

      // Right shadow edge
      p.fill(0, 0, 0, 28);
      p.rect(x + VIAL_W/2 - 13, ly, 9, LAYER_H);

      // Divider
      if (i < vial.layers.length - 1) {
        p.stroke(0, 0, 0, 50);
        p.strokeWeight(1);
        p.line(x - VIAL_W/2 + 3, ly + LAYER_H, x + VIAL_W/2 - 3, ly + LAYER_H);
        p.noStroke();
      }
    });

    ctx.restore();
  },

  drawAll(p, vials, positions, selected, mechanic) {
    vials.forEach((vial, i) => {
      if (!positions[i]) return;
      this.draw(p, vial, positions[i].x, positions[i].y, i === selected, mechanic);
    });
  },
};