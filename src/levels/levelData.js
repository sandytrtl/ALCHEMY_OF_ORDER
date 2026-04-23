
const RAW_LEVEL_DATA = [


{
  id: 1, name: 'First Brew',
  vialCount: 3, colors: ['red'], emptyVials: 2,
  expectedMoves: 3, mechanic: 'none', coinReward: 20,
  starThresholds: { 3: 3, 2: 5, 1: 8 },
  hint: 'Pour all the red into one vial. Use the empty vial as a buffer!',
  layout: [
    { layers: ['red','red'] }, // vial 1: full red
    { layers: ['red','red'] },                         // vial 2: empty buffer
    { layers: [] },                         // vial 3: empty buffer
  ],
},

{
  id: 2, name: 'Dual Tones',
  vialCount: 3, colors: ['orange','purple'], emptyVials: 1,
  expectedMoves: 4, mechanic: 'none', coinReward: 25,
  starThresholds: { 3: 4, 2: 6, 1: 10 },
  hint: 'Only the same color can stack. Use the empty vial to move colors around.',
  layout: [
    { layers: ['purple','orange','purple','orange'] }, // vial 1: alternating
    { layers: ['orange','purple','orange','purple'] }, // vial 2: alternating
    { layers: [] },                                     // vial 3: empty buffer
  ],
},

{
  id: 3, name: 'Triple Vials',
  vialCount: 5, colors: ['red','blue','yellow'], emptyVials: 2,
  expectedMoves: 6, mechanic: 'none', coinReward: 35,
  starThresholds: { 3: 6, 2: 10, 1: 16 },
  layout: [
    { layers: ['yellow','blue','red','yellow'] },  // vial 1
    { layers: ['blue','red','yellow','blue'] },    // vial 2
    { layers: ['red','yellow','blue','red'] },     // vial 3
    { layers: [] },                                // empty buffer
    { layers: [] },                                // empty buffer
  ],
},

{
  id: 4, name: 'Chromatic',
  vialCount: 7, colors: ['purple','teal','brown','orange','pink'], emptyVials: 2,
  expectedMoves: 14, mechanic: 'none', coinReward: 50,
  starThresholds: { 3: 14, 2: 20, 1: 30 },
  layout: [
    { layers: ['purple','teal','pink','purple'] },   // vial 1
    { layers: ['orange','teal','brown','brown'] },   // vial 2
    { layers: ['teal','pink','brown','brown'] },     // vial 3
    { layers: ['orange','purple','pink','orange'] }, // vial 4
    { layers: ['teal','purple','pink','orange'] },   // vial 5
    { layers: [] },                                  // empty
    { layers: [] },                                  // empty
  ],
},

{
  id: 5, name: 'Quintessence',
  vialCount: 8, colors: ['blue','pink','purple','green','teal','orange'], emptyVials: 2,
  expectedMoves: 22, mechanic: 'none', coinReward: 65,
  starThresholds: { 3: 22, 2: 32, 1: 46 },
  layout: [
    { layers: ['blue','pink','blue','purple'] },    // vial 1
    { layers: ['green','blue','purple','blue'] },   // vial 2
    { layers: ['orange','pink','purple','teal'] },  // vial 3
    { layers: ['purple','teal','green','orange'] }, // vial 4
    { layers: ['teal','green','teal','pink'] },     // vial 5
    { layers: ['orange','pink','green','orange'] }, // vial 6
    { layers: [] },                                 // empty
    { layers: [] },                                 // empty
  ],
},

  /* ══════════════════════════════════════════════════════════════
     LEVELS 6–10: Fading Vials
  ══════════════════════════════════════════════════════════════ */
  {
    id: 6, name: 'Fading Memory',
    // Intro to fading — small board, easy par, learn the mechanic
    vialCount: 4, colors: ['red', 'blue', 'green'], emptyVials: 1,
    expectedMoves: 8, mechanic: 'fading', coinReward: 60,
    starThresholds: { 3: 8, 2: 13, 1: 20 },
  },
  {
    id: 7, name: 'Mist Vials',
    // 4 colors, fading pressure increases
    vialCount: 5, colors: ['red', 'blue', 'green', 'yellow'], emptyVials: 1,
    expectedMoves: 11, mechanic: 'fading', coinReward: 60,
    starThresholds: { 3: 11, 2: 17, 1: 26 },
  },
  {
    id: 8, name: 'Vanishing Hues',
    // Same 4 colors but harder scramble, tighter par
    vialCount: 5, colors: ['red', 'blue', 'green', 'yellow'], emptyVials: 1,
    expectedMoves: 13, mechanic: 'fading', coinReward: 70,
    starThresholds: { 3: 13, 2: 20, 1: 30 },
  },
  {
    id: 9, name: 'Ghost Brew',
    // 5 colors, 2 empties — fading + larger board
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 16, mechanic: 'fading', coinReward: 70,
    starThresholds: { 3: 16, 2: 24, 1: 36 },
  },
  {
    id: 10, name: 'Phantom Potions',
    // Hardest fading level — tight par forces planning
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 18, mechanic: 'fading', coinReward: 80,
    starThresholds: { 3: 18, 2: 27, 1: 40 },
  },

 /* ══════════════════════════════════════════════════════════════
      LEVELS 11–15: Locked Potions
  ══════════════════════════════════════════════════════════════ */
  {
    id: 11, name: 'Rune Gate',
    vialCount: 5, colors: ['red', 'blue', 'green'], emptyVials: 2,
    expectedMoves: 9, mechanic: 'rune', coinReward: 80,
    starThresholds: { 3: 9, 2: 14, 1: 22 },
    // One locked vial — unlocks when blue vial is completed
    lockConfig: { lockedVials: [{ vialIndex: 0, lockColor: 'blue' }] },
    lockColor: 'blue', // Direct flag for the loader
  },
  {
    id: 12, name: 'Catalyst Test',
    vialCount: 6, colors: ['red', 'blue', 'green', 'yellow'], emptyVials: 2,
    expectedMoves: 11, mechanic: 'rune', coinReward: 90,
    starThresholds: { 3: 11, 2: 17, 1: 26 },
    // One locked vial — unlocks when red vial is completed
    lockConfig: { lockedVials: [{ vialIndex: 1, lockColor: 'red' }] },
    lockColor: 'red',
  },
  {
    id: 13, name: 'Sealed Vials',
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 15, mechanic: 'rune', coinReward: 90,
    starThresholds: { 3: 15, 2: 23, 1: 34 },
    // Two locked vials, same color key — both unlock when green is completed
    lockConfig: { lockedVials: [
      { vialIndex: 0, lockColor: 'green' },
      { vialIndex: 2, lockColor: 'green' },
    ]},
    lockColor: 'green',
  },
  {
    id: 14, name: 'The Key Brew',
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 17, mechanic: 'rune', coinReward: 100,
    starThresholds: { 3: 17, 2: 26, 1: 38 },
    // Two locked vials, same color key — unlock when yellow is completed
    lockConfig: { lockedVials: [
      { vialIndex: 1, lockColor: 'yellow' },
      { vialIndex: 3, lockColor: 'yellow' },
    ]},
    lockColor: 'yellow',
  },
  {
    id: 15, name: 'Arcane Lock',
    vialCount: 8, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], emptyVials: 2,
    expectedMoves: 20, mechanic: 'rune', coinReward: 100,
    starThresholds: { 3: 20, 2: 30, 1: 44 },
    // Two locked vials, DIFFERENT color keys
    lockConfig: { lockedVials: [
      { vialIndex: 0, lockColor: 'purple' },
      { vialIndex: 3, lockColor: 'orange' },
    ]},
    // For level 15, the multi-lock logic in gameMechanics.js 
    // will handle the individual colors from lockConfig.
  },

  /* ══════════════════════════════════════════════════════════════
     LEVELS 16–20: Timed Potion (Stability Meter)
  ══════════════════════════════════════════════════════════════ */
  {
    id: 16, name: 'Volatile Brew',
    vialCount: 5, colors: ['red', 'blue', 'green'], emptyVials: 2,
    expectedMoves: 10, mechanic: 'unstable', coinReward: 110,
    starThresholds: { 3: 10, 2: 16, 1: 24 },
    // Slow drain — generous time (~50s full drain)
    timerConfig: { drainPerSec: 2 },
  },
  {
    id: 17, name: 'Reaction Chain',
    vialCount: 6, colors: ['red', 'blue', 'green', 'yellow'], emptyVials: 2,
    expectedMoves: 13, mechanic: 'unstable', coinReward: 110,
    starThresholds: { 3: 13, 2: 20, 1: 30 },
    // Slow drain
    timerConfig: { drainPerSec: 2 },
  },
  {
    id: 18, name: 'Chaos Vials',
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 16, mechanic: 'unstable', coinReward: 120,
    starThresholds: { 3: 16, 2: 25, 1: 36 },
    // Moderate drain (~33s)
    timerConfig: { drainPerSec: 3 },
  },
  {
    id: 19, name: 'Powder Keg',
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 19, mechanic: 'unstable', coinReward: 120,
    starThresholds: { 3: 19, 2: 29, 1: 42 },
    // Moderate drain
    timerConfig: { drainPerSec: 3 },
  },
  {
    id: 20, name: 'Grand Unstable',
    vialCount: 8, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], emptyVials: 2,
    expectedMoves: 22, mechanic: 'unstable', coinReward: 130,
    starThresholds: { 3: 22, 2: 33, 1: 48 },
    // Fast drain (~20s) — tightest timing
    timerConfig: { drainPerSec: 5 },
  },

  /* ══════════════════════════════════════════════════════════════
     LEVELS 21–25: Hidden Layers + Timer Combination
     hiddenConfig.hiddenBelow: how many bottom layers are hidden
     hiddenConfig.reveals:     number of reveal taps allowed
     hiddenConfig.drainPerSec: timer drain rate
  ══════════════════════════════════════════════════════════════ */
  {
    id: 21, name: 'The Convergence',
    vialCount: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'], emptyVials: 2,
    expectedMoves: 20, mechanic: 'combined', coinReward: 140,
    starThresholds: { 3: 20, 2: 30, 1: 44 },
    // Fewer hidden layers, more reveals, slower timer
    hiddenConfig: { hiddenBelow: 1, reveals: 3, drainPerSec: 2 },
  },
  {
    id: 22, name: 'Master Brew',
    vialCount: 8, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], emptyVials: 2,
    expectedMoves: 24, mechanic: 'combined', coinReward: 150,
    starThresholds: { 3: 24, 2: 36, 1: 52 },
    // Fewer hidden layers, more reveals, slower timer
    hiddenConfig: { hiddenBelow: 1, reveals: 3, drainPerSec: 2 },
  },
  {
    id: 23, name: 'Alchemical',
    vialCount: 9, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'teal'], emptyVials: 2,
    expectedMoves: 28, mechanic: 'combined', coinReward: 160,
    starThresholds: { 3: 28, 2: 42, 1: 60 },
    // More hidden layers, fewer reveals
    hiddenConfig: { hiddenBelow: 2, reveals: 2, drainPerSec: 3 },
  },
  {
    id: 24, name: 'The Ordeal',
    vialCount: 9, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'teal'], emptyVials: 2,
    expectedMoves: 30, mechanic: 'combined', coinReward: 170,
    starThresholds: { 3: 30, 2: 45, 1: 65 },
    // More hidden layers, fewer reveals
    hiddenConfig: { hiddenBelow: 2, reveals: 2, drainPerSec: 3 },
  },
  {
    id: 25, name: 'True Mastery',
    vialCount: 11, colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'teal', 'pink'], emptyVials: 3,
    expectedMoves: 36, mechanic: 'combined', coinReward: 200,
    starThresholds: { 3: 36, 2: 54, 1: 78 },
    // Full combination — most hidden, fewest reveals, fastest drain
    hiddenConfig: { hiddenBelow: 3, reveals: 1, drainPerSec: 4 },
  },
];