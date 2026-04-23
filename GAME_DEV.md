FILE STRUCTURE:

alchemy-of-order/
├── index.html                  # App shell, loads all screens + canvas
├── css/
│   ├── main.css                # Global styles, fonts, variables
│   ├── intro.css               # Intro screen styles
│   ├── menu.css                # Main menu styles
│   ├── hud.css                 # In-game HUD (moves, stars, coins)
│   ├── winScreen.css           # Win/lose screen styles
│   └── shop.css                # Shop screen styles
├── html/
│   ├── intro.html              # Intro screen markup
│   ├── menu.html               # Level select + main menu
│   ├── hud.html                # HUD overlay on top of canvas
│   ├── winScreen.html          # Win screen with stars + rewards
│   └── shop.html               # Shop/background selector
├── js/
│   ├── screenManager.js        # Shows/hides HTML screens, bridges HTML ↔ p5
│   ├── shopLogic.js            # Coin system, unlocks, localStorage
│   └── soundManager.js         # Reserved for audio later
├── sketch.js                   # p5.js entry — only runs during gameplay
├── src/
│   ├── game.js                 # Core game state, move counter, star logic
│   ├── vial.js                 # Vial class
│   ├── potion.js               # Potion layer class
│   ├── physics/
│   │   ├── liquidPhysics.js    # Pour animation, liquid flow
│   │   └── particleSystem.js   # Drips, bubbles, splashes
│   ├── levels/
│   │   ├── Level.js            # Level data container class
│   │   ├── LevelLoader.js      # Spawns vials, sets game state
│   │   └── levelData.js        # All 25 level configs
│   ├── mechanics.js            # Special mechanic types
│   ├── character.js            # Witch float animation
│   └── ui.js                   # Canvas-side UI (vial highlights, invalid move flash)
├── assets/
│   ├── images/
│   │   ├── backgrounds/
│   │   ├── character/
│   │   ├── vials/
│   │   └── ui/
│   └── sounds/
└── README.md