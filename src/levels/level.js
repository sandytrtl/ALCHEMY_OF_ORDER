class Level {
  /**
   * @param {object} config 
   * @param {number}   config.id
   * @param {string}   config.name
   * @param {number}   config.vialCount       
   * @param {string[]} config.colors         
   * @param {number}   config.emptyVials      
   * @param {number}   config.expectedMoves   
   * @param {string}   config.mechanic        
   * @param {number}   config.coinReward      
   * @param {object}   config.starThresholds  
   */
  constructor({
  id,
  name,
  vialCount,
  colors,
  emptyVials,
  expectedMoves,
  mechanic,
  coinReward,
  starThresholds,
  layout       = null,   
  lockConfig   = null,   
  timerConfig  = null,   
  hiddenConfig = null,   
}) {
  this.id             = id;
  this.name           = name;
  this.vialCount      = vialCount;
  this.colors         = colors;
  this.emptyVials     = emptyVials;
  this.filledVials    = vialCount - emptyVials;
  this.expectedMoves  = expectedMoves;
  this.mechanic       = mechanic;
  this.coinReward     = coinReward;
  this.starThresholds = starThresholds;
  this.layout         = layout;       
  this.timerConfig    = timerConfig;  
  this.lockConfig     = lockConfig;   
  this.hiddenConfig   = hiddenConfig; 
}

  /**

   * @param  {number} moves
   * @returns {number} 0, 1, 2, or 3
   */
  calculateStars(moves) {
    if (moves <= this.starThresholds[3]) return 3;
    if (moves <= this.starThresholds[2]) return 2;
    if (moves <= this.starThresholds[1]) return 1;
    return 0;
  }

  get movesLimit() {
    return this.starThresholds[1];
  }

  /**
   * @param  {number} stars - 1, 2, or 3
   * @returns {number}
   */
  scaledReward(stars) {
    return Math.round(this.coinReward * (stars / 3));
  }

  get hasSpecialMechanic() {
    return this.mechanic !== 'none';
  }

  toString() {
    return `Level ${this.id}: ${this.name} [${this.mechanic}]`;
  }
}