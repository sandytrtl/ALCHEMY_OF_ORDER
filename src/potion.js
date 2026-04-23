const COLOR_MAP = {
  red:    [239,  68,  68],
  blue:   [ 59, 130, 246],
  green:  [ 34, 197,  94],
  yellow: [234, 179,   8],
  purple: [168,  85, 247],
  orange: [249, 115,  22],
  teal:   [ 20, 184, 166],
  pink:   [236,  72, 153],
};

/**
 * 
 * @param  {string} name
 * @returns {number[]}
 */
function getColorRGB(name) {
  return COLOR_MAP[name] || [180, 180, 180];
}

/**
 * 
 * @param  {string} name
 * @returns {string}
 */
function getColorHex(name) {
  const rgb = getColorRGB(name);
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}



class PotionLayer {
  /**
   * @param {string}  color   
   * @param {string}  [type]  
   * @param {number}  [alpha] 
   */
  constructor(color, type = 'normal', alpha = 255) {
    this.color = color;
    this.type  = type;   // affects special behaviour in mechanics.js
    this.alpha = alpha;  // used by fading vials
  }

  get rgb() { return getColorRGB(this.color); }

  get isUnstable() { return this.type === 'unstable'; }

  get isCatalyst() { return this.type === 'catalyst'; }

  clone() {
    return new PotionLayer(this.color, this.type, this.alpha);
  }
}