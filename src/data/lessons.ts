import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 'intro',
    title: 'The World of Cell Worlds',
    subtitle: 'What are Cellular Automata?',
    badge: '1. Hello Grid!',
    paragraphs: [
      'Welcome! Imagine a grid of tiny, squishy blocks resembling pixels on a screen or bacteria in a petri dish. In computational science, we call these "Cells".',
      'Each cell has a current "state" (like being alive or dead) and lives by one simple rule: no central planner or leader exists! Each cell decides what to do next solely by peeking at its immediate 8 neighbors.',
      'From this absolute local simple control emerges staggeringly complex global behaviors. Let’s play around with a blank canvas to see how cells feel!'
    ],
    challengeTitle: 'Your First Scribble',
    challengeInstruction: 'Draw at least 15 living cells on the canvas, then press Play (or tap Step) to watch them interact with time!',
    challengeGoalText: 'Paint some blocks and run the steps.',
    modelType: 'life',
    modelPreset: 'sparse_random',
    checkCompletion: (state, drawHistoryCount) => {
      // Completed if stepCount > 0 and they drew some cells or started with random
      const aliveCount = state.grid.flat().filter(cell => cell === 1).length;
      return state.stepCount > 0 && aliveCount > 0;
    },
    helpOverlay: 'Drag/click on the grid below to toggle cells. Tap "Play" or "Step Forward" to move through time.'
  },
  {
    id: 'conway',
    title: "Conway's Game of Life",
    subtitle: 'The Beauty of Spontaneous Balance',
    badge: '2. Birth & Death',
    paragraphs: [
      "In 1970, mathematician John Conway set out to build a world using three beautifully elegant rules of nature:",
      "💀 Lonely or Crowded? A living cell dies if it has fewer than 2 neighbors (underpopulation) or more than 3 neighbors (overpopulation).",
      "❇️ Perfect Harmony: A living cell survives if it has exactly 2 or 3 neighbors.",
      "👶 New Life: An empty, dead cell becomes alive if it is surrounded by exactly 3 living neighbors.",
      "With these simple forces of birth and decay, Conway created stable structures, infinite blinking clocks, and moving spaceships!"
    ],
    challengeTitle: 'Release a Spaceship!',
    challengeInstruction: 'Use the Template picker at the bottom to spawn a "Glider". Place it anywhere and press Play to watch it travel across the screen!',
    challengeGoalText: 'Select and spawn a Glider, then watch it travel.',
    modelType: 'life',
    modelPreset: 'glider',
    checkCompletion: (state) => {
      // Clear checking of step updates
      return state.stepCount >= 10 && state.grid.flat().some(cell => cell === 1);
    },
    helpOverlay: 'Gliders are self-sustaining structures that walk diagonally. Switch template to "Glider", then click on empty grid cells!'
  },
  {
    id: 'elementary',
    title: "The 1-Dimensional Universe",
    subtitle: 'Scrolling Down Through Space & Time',
    badge: '3. Rule 30',
    paragraphs: [
      "Cells do not need a full 2D playground. What if they lived on a single horizontal line?",
      "In Elementary Cellular Automata, cells look only at their left neighbor, themselves, and their right neighbor. To see history unfold, we write the next step directly underneath the current step, scrolling downwards like an ancient scroll.",
      "Meet Rule 30. Beginning with just ONE single black cell, this simple three-neighbor rule creates an intensely chaotic, organic pattern. It is so unpredictable that Stephen Wolfram uses it for generating random sequences!"
    ],
    challengeTitle: 'Inspect a Fractal',
    challengeInstruction: 'Try entering another famous rule like "Rule 90" (Sierpinski triangles) or "Rule 110" (which is Turing complete!) in the Rule edit box and run the simulation.',
    challengeGoalText: 'Change the Elementary Rule number and press Reset or Play to see the patterns scroll down.',
    modelType: 'elementary',
    modelPreset: 'rule_30',
    checkCompletion: (state) => {
      return state.stepCount > 15 && state.modelType === 'elementary';
    },
    helpOverlay: 'In 1D mode, each row represents one tick of the clock. Toggle the Rule parameters (0 to 255) to see the vast fractal tree of possible rules.'
  },
  {
    id: 'fire',
    title: 'The Forest Fire Ecology',
    subtitle: 'Systemic Play with Wildfires',
    badge: '4. Critical Point',
    paragraphs: [
      "Let's change our cells to trees 🌲, fire 🔥, and charred ash 🔲.",
      "This universe has three states: Empty ground (0), Tree (1), and Burning (2). Spreading fire is simple: fire engulfs any touching tree. Trees grow slowly on empty spots, and lightning strikes randomly to spark new blazes.",
      "If tree growth density is extremely high, a lightning strike sets off a catastrophic, runaway wildfire. If growth density is slow, fires burn out immediately. This is the 'Percolation Critical Point'!"
    ],
    challengeTitle: 'Tame the Wildfire',
    challengeInstruction: 'Run the forest fire simulation. Tweak the Growth of Trees or Sparks probability parameters to find a steady-state cycle where the woods perpetually burn and regrow!',
    challengeGoalText: 'Watch the trees ignite, burn to ash, and regrow over 20 steps.',
    modelType: 'fire',
    modelPreset: 'forest_fire',
    checkCompletion: (state) => {
      return state.stepCount >= 20 && state.modelType === 'fire';
    }
  },
  {
    id: 'sand',
    title: 'Friction and Flowing Sand',
    subtitle: 'Simple Forces, Realistic Fluids',
    badge: '5. Sandbox Sand',
    paragraphs: [
      "Can cellular automata behave like physical objects? Yes!",
      "Let's add simple gravity. Sand grains 🟡 fall downwards. If blocked by solid stone 🪨 or other sand, they roll sideways and fall down diagonally.",
      "Water 💧 is even slipperier: if direct fall is blocked, it expands aggressively left and right to fill flat lakes. Stone 🪨 is immovable.",
      "With these local choices, complex behaviors like shifting sands, sliding avalanches, and floating water reservoirs emerge naturally!"
    ],
    challengeTitle: 'The Fluid Obstacle Course',
    challengeInstruction: 'Select the Stone tool 🪨 to build a mini slide on the canvas. Then, paint a cloud of Sand 🟡 or Water 💧 directly above and watch physical gravity unfold!',
    challengeGoalText: 'Combine Stone, Sand, and Water, then step or play.',
    modelType: 'sand',
    modelPreset: 'sand_sandbox',
    checkCompletion: (state) => {
      const flattened = state.grid.flat();
      const hasStone = flattened.includes(2);
      const hasSand = flattened.includes(1);
      const hasWater = flattened.includes(3);
      return state.stepCount > 10 && hasStone && (hasSand || hasWater);
    }
  },
  {
    id: 'epidemic',
    title: 'Viral Contagion & Herd Immunity',
    subtitle: 'The Biology of Spread',
    badge: '6. Viral Outbreak',
    paragraphs: [
      "Let's turn cells into human populations to model how pandemics spread.",
      "Healthy people are Susceptible 🟢. If they touch an Infected person 🔴, there is a probability they catch the virus. Over time, sick cells recover into Immune 🔵 (cannot catch or transmit) or unfortunately pass away Gray ⚫.",
      "By adding vaccines or quarantines (painting blocks of Immune cells 🔵 beforehand), we isolate viral chains. Watch the infection flatten completely if enough immune cells exist!"
    ],
    challengeTitle: 'Achieve Herd Immunity!',
    challengeInstruction: 'Press Play to watch the infection wave. Paint some Immune barriers 🔵 or decrease the infection rate to let the population recover without catching the virus!',
    challengeGoalText: 'Achieve a stable state where NO red infected cells remain.',
    modelType: 'epidemic',
    modelPreset: 'epidemic_wave',
    checkCompletion: (state) => {
      // Check if simulation ran and there are no infected cells left
      const flat = state.grid.flat();
      const hasInfected = flat.includes(1);
      return state.stepCount >= 15 && !hasInfected;
    }
  }
];
