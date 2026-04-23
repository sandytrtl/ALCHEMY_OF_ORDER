const GameState = (function () {
  const SAVE_KEY = 'alchemy_of_order_save';

  const defaults = {
    coins:             120,
    unlockedLevels:    [1],
    levelStars:        {},
    ownedBackgrounds:  ['default'],
    activeBackground:  'default',
  };

  let state = Object.assign({}, defaults);

  function load() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) state = Object.assign({}, defaults, JSON.parse(saved));
    } catch (e) {
      console.warn('[GameState] Could not load save data:', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[GameState] Could not save data:', e);
    }
  }

  function addCoins(n) {
    state.coins += n;
    save();
    updateCoinDisplays();
  }

  /**
   * Deduct coins 
   * @returns {boolean} true if the transaction succeeded.
   */
  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    save();
    updateCoinDisplays();
    return true;
  }

  function updateCoinDisplays() {
    ['menu-coin-count', 'hud-coins', 'shop-coin-count'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = state.coins;
    });
  }

  /**
   * @param {number} levelId
   * @param {number} moves       
   * @param {number} par         
   * @param {number} starsEarned 
   * @param {number} reward      
   */
  function completeLevel(levelId, moves, par, starsEarned, reward) {
    const prevStars = state.levelStars[levelId] || 0;
    if (starsEarned > prevStars) state.levelStars[levelId] = starsEarned;

    const next = levelId + 1;
    if (next <= 25 && !state.unlockedLevels.includes(next)) {
      state.unlockedLevels.push(next);
    }

    addCoins(reward);
    save();
  }


  load();

  return { state, save, load, addCoins, spendCoins, updateCoinDisplays, completeLevel };
})();


const BACKGROUNDS = [
  {
    id: 'default', name: 'Arcane Void', emoji: '🌌', free: true,
    base:   '#0a0612',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #2a1650 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #1a0d3a 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #0d1a3a 0%, transparent 60%)',
    ],
  },
  {
    id: 'forest', name: 'Mystic Forest', emoji: '🌿', free: false,
    base:   '#060f08',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #0d3320 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #061a0e 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #0a2416 0%, transparent 60%)',
    ],
  },
  {
    id: 'volcano', name: 'Lava Forge', emoji: '🌋', free: false,
    base:   '#0f0604',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #3d1208 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #1f0a04 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #2b0e06 0%, transparent 60%)',
    ],
  },
  {
    id: 'ocean', name: 'Deep Current', emoji: '🌊', free: false,
    base:   '#030d18',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #0a2a4a 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #061525 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #081e36 0%, transparent 60%)',
    ],
  },
  {
    id: 'celestial', name: 'Star Charts', emoji: '✨', free: false,
    base:   '#06030f',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #1e0a3d 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #10062b 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #160840 0%, transparent 60%)',
    ],
  },
  {
    id: 'autumn', name: 'Ember Season', emoji: '🍂', free: false,
    base:   '#0f0804',
    radials: [
      'radial-gradient(ellipse 80% 60% at 50% 0%,  #3d2008 0%, transparent 70%)',
      'radial-gradient(ellipse 40% 40% at 20% 80%, #1f1004 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 50% at 80% 90%, #2b1806 0%, transparent 60%)',
    ],
  },
];

function applyBackground(id) {
  const bg = BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
  const gradient = [...bg.radials, bg.base].join(', ');

  // Apply to body and every .arcane-bg element

  
  document.body.style.background = gradient;
  document.querySelectorAll('.arcane-bg').forEach(el => {
    el.style.background = gradient;
  });

  document.documentElement.style.setProperty('--deep-void', bg.base);

  // Persist
  GameState.state.activeBackground = id;
  GameState.save();
}

// Apply saved background immediately on load
document.addEventListener('DOMContentLoaded', () => {
  applyBackground(GameState.state.activeBackground || 'default');
});



function initShop() {
  GameState.updateCoinDisplays();

  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = '';

  BACKGROUNDS.forEach(bg => {
    const owned  = bg.free || GameState.state.ownedBackgrounds.includes(bg.id);
    const active = GameState.state.activeBackground === bg.id;

    const item = document.createElement('div');
    item.className = [
      'shop-item',
      owned  ? 'owned'     : '',
      active ? 'active-bg' : '',
    ].join(' ').trim();

    item.innerHTML = `
      ${active ? '<span class="shop-item-badge badge-active">Active</span>'
               : owned ? '<span class="shop-item-badge badge-owned">Owned</span>' : ''}
      <div class="shop-item-preview" style="background:${bg.base}">${bg.emoji}</div>
      <span class="shop-item-name">${bg.name}</span>
      <span class="shop-item-price">${bg.free ? 'Free' : owned ? '✓' : '🪙 1000'}</span>
    `;

    if (owned && !active) {
      // Owned but not active → clicking activates it
      item.onclick = () => {
        applyBackground(bg.id);
        showToast(`"${bg.name}" set as active!`);
        initShop();
      };
    } else if (!owned) {
      // Not owned → clicking purchases it
      item.onclick = () => {
        if (GameState.spendCoins(1000)) {
          GameState.state.ownedBackgrounds.push(bg.id);
          GameState.save();
          applyBackground(bg.id);
          showToast(`"${bg.name}" unlocked!`);
          initShop();
        } else {
          showToast('Not enough coins! 🪙');
        }
      };
    }

    grid.appendChild(item);
  });

  // Wire "Unlock Random" button
  const randomBtn = document.getElementById('btn-unlock-random');
  if (randomBtn) {
    randomBtn.onclick = () => {
      const locked = BACKGROUNDS.filter(
        b => !b.free && !GameState.state.ownedBackgrounds.includes(b.id)
      );
      if (locked.length === 0) {
        showToast('All backgrounds already unlocked!');
        return;
      }
      if (GameState.spendCoins(1000)) {
        const pick = locked[Math.floor(Math.random() * locked.length)];
        GameState.state.ownedBackgrounds.push(pick.id);
        GameState.save();
        applyBackground(pick.id);
        showToast(`🎲 Unlocked "${pick.name}"!`);
        initShop();
      } else {
        showToast('Not enough coins! Need 🪙 1000');
      }
    };
  }
}