# About the Project
**Alchemy of Order** is a logic-based puzzle game developed as a deep dive into interactive web mechanics and physics-based animations. Players take on the role of an alchemist tasked with sorting magical reagents into their correct vials. The project focuses on a seamless user experience, featuring a custom-built liquid physics system and a dynamic shop interface for character and background customization.

# Key Technical Features
* **Physics-driven Visuals:** Implementation of a particle-based liquid system using `p5.js` for realistic pouring and mixing effects.
* **Modular Architecture:** Organized using a clear separation of concerns—Data, Game Logic, Physics, and Rendering layers.
* **State Management:** Robust win-detection logic, move tracking, and undo functionality.

# File Structure

```
alchemy-of-order/
├── index.html                  # App shell — loads all screens + scripts
├── css/
│   ├── main.css                # Global styles, CSS variables, shared buttons
│   ├── intro.css               # Intro screen (witch, title, animations)
│   ├── menu.css                # Level select grid
│   ├── hud.css                 # In-game HUD (moves, stars, coins)
│   ├── winScreen.css           # Win screen card + star animation
|    ├── tutorial.css  
│   └── shop.css                # Curiosity Shop / background selector
├── html/                       # Screen markup partials (reference / documentation)
│   ├── intro.html
│   ├── menu.html
│   ├── hud.html
│   ├── winScreen.html
│   └── shop.html
├── js/
    ├── tutorial.js  
│   ├── screenManager.js        # Screen transitions + HTML ↔ p5 bridge
│   ├── shopLogic.js            # GameState (save/load), coin system, shop UI
│   └── soundManager.js         # Audio (reserved for future use)
├── sketch.js                   # p5.js entry — setup, draw, mousePressed
├── src/
│   ├── game.js                 # GameEngine: move counter, undo, win detection
│   ├── vial.js                 # Vial class: layer stack, pour validation
│   ├── potion.js               # PotionLayer class + COLOR_MAP
│   ├── physics/
│   │   ├── liquidPhysics.js    # LiquidPour (bezier arc) + LiquidFill animation
│   │   └── particleSystem.js   # Splash, bubble, drip particles
│   ├── levels/
│   │   ├── Level.js            # Level data container class
│   │   ├── LevelLoader.js      # LEVEL_DATA registry + vial builder + layout
│   │   └── levelData.js        # Raw config for all 25 levels
│   ├── mechanics.js            # Fading, Rune, Catalyst, Unstable, Combined handlers
│   ├── character.js            # Witch float + state animation controller
│   └── ui.js                   # VialRenderer — all p5 vial drawing code
└── assets/
    ├── images/
    │   ├── backgrounds/        # Background theme images (JPG/PNG)
    │   ├── character/          # witch_idle.png, witch_happy.png, witch_reject.png
    │   ├── vials/              # Vial graphics (if using image-based vials)
    │   └── ui/                 # Stars, coins, buttons, icons
    └── sounds/                 # Audio files (MP3/OGG)
```

## Architecture

| Layer | Files | Responsibility |
|---|---|---|
| **Data** | `levelData.js`, `Level.js`, `LevelLoader.js` | Level configs, vial generation, layout |
| **Game Logic** | `game.js`, `vial.js`, `potion.js`, `mechanics.js` | State, moves, undo, win detection |
| **Physics** | `liquidPhysics.js`, `particleSystem.js` | Pour animation, particles |
| **Rendering** | `sketch.js`, `ui.js`, `character.js` | p5.js draw loop, vial visuals |
| **HTML UI** | `screenManager.js`, `shopLogic.js` | Screen transitions, HUD, shop |
| **Styling** | `css/*.css` | All visual styling by screen |


## Level Progression

| Levels | Mechanic | Description |
|---|---|---|
| 1–5   | None     | Core potion sorting |
| 6–10  | Fading   | Vial labels fade (memory challenge) |
| 11–15 | Rune / Catalyst | Locked vials, planning required |
| 16–20 | Unstable | Potions shuffle unexpectedly |
| 21–25 | Combined | All mechanics together |