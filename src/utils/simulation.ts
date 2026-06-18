import { CellularAutomataState, ModelType } from '../types';

// Helper to create an empty 2D grid
export function createEmptyGrid(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

// Generate presets
export function getPresetGrid(modelType: ModelType, width: number, height: number, elementaryRule: number = 30): number[][] {
  const grid = createEmptyGrid(width, height);
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  switch (modelType) {
    case 'life':
      // Glider preset
      grid[2][3] = 1;
      grid[3][4] = 1;
      grid[4][2] = 1;
      grid[4][3] = 1;
      grid[4][4] = 1;

      // Pulsar blinker preset in center
      const py = midY - 1;
      const px = midX;
      if (py > 5 && py < height - 5 && px > 5 && px < width - 5) {
        grid[py][px - 1] = 1;
        grid[py][px] = 1;
        grid[py][px + 1] = 1;
      }
      break;

    case 'elementary':
      // One single cell in the center of the first row
      grid[height - 1][midX] = 1; 
      break;

    case 'fire':
      // Sparse trees with a burning tree in the center
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (Math.random() < 0.55) {
            grid[y][x] = 1; // Tree
          }
        }
      }
      grid[midY][midX] = 2; // Burning in the center
      break;

    case 'sand':
      // Create some initial stones
      for (let x = 10; x < width - 10; x++) {
        const y = Math.floor(height * 0.7) + Math.floor(Math.sin(x * 0.2) * 2);
        if (y < height) {
          grid[y][x] = 2; // Stone
        }
      }
      // Create some clouds of sand particles
      for (let y = 2; y < 8; y++) {
        for (let x = midX - 6; x < midX + 6; x++) {
          if (Math.random() < 0.6) {
            grid[y][x] = 1; // Sand
          }
        }
      }
      break;

    case 'epidemic':
      // Random susceptible crowd with 1 infected cell in the center
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (Math.random() < 0.75) {
            grid[y][x] = 0; // Susceptible
          } else {
            grid[y][x] = 2; // Initially Vaccinated/Immune
          }
        }
      }
      grid[midY][midX] = 1; // Patient zero (Infected)
      break;
  }

  return grid;
}

// Compute the next tick for the entire system
export function computeNextStep(state: CellularAutomataState): number[][] {
  const { grid, width, height, modelType } = state;
  const nextGrid = createEmptyGrid(width, height);

  switch (modelType) {
    case 'life': {
      const { birth, survival } = state.lifeRules;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const current = grid[y][x];
          
          // Count neighbors with toroidal wrap-around boundaries
          let aliveNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ny = (y + dy + height) % height;
              const nx = (x + dx + width) % width;
              if (grid[ny][nx] === 1) {
                aliveNeighbors++;
              }
            }
          }

          if (current === 1) {
            nextGrid[y][x] = survival.includes(aliveNeighbors) ? 1 : 0;
          } else {
            nextGrid[y][x] = birth.includes(aliveNeighbors) ? 1 : 0;
          }
        }
      }
      break;
    }

    case 'elementary': {
      const rule = state.elementaryRule;
      // Copy all rows upwards to create scrolling history feed
      for (let y = 0; y < height - 1; y++) {
        nextGrid[y] = [...grid[y + 1]];
      }

      // Generate the NEW bottom row based on the OLD bottom row
      const oldBottomRow = grid[height - 1];
      const newBottomRow = Array(width).fill(0);

      for (let x = 0; x < width; x++) {
        const left = oldBottomRow[(x - 1 + width) % width];
        const mid = oldBottomRow[x];
        const right = oldBottomRow[(x + 1 + width) % width];

        // 3-bit pattern
        const bitPattern = (left << 2) | (mid << 1) | right;
        // Determine state based on Rule binary representation
        const isNewCellActive = (rule >> bitPattern) & 1;
        newBottomRow[x] = isNewCellActive ? 1 : 0;
      }
      nextGrid[height - 1] = newBottomRow;
      break;
    }

    case 'fire': {
      const { regrowth, lightning } = state.fireProb;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const current = grid[y][x];

          if (current === 0) {
            // Empty ground sprouts tree with probability
            nextGrid[y][x] = Math.random() < regrowth ? 1 : 0;
          } else if (current === 1) {
            // Tree: catches fire if any adjacent cell in 8-direction is burning
            let neighborBurning = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ny = (y + dy + height) % height;
                const nx = (x + dx + width) % width;
                if (grid[ny][nx] === 2) {
                  neighborBurning = true;
                  break;
                }
              }
              if (neighborBurning) break;
            }

            if (neighborBurning) {
              nextGrid[y][x] = 2; // Ignite!
            } else {
              // Lightning strike
              nextGrid[y][x] = Math.random() < lightning ? 2 : 1;
            }
          } else if (current === 2) {
            // Burning turns to Ash
            nextGrid[y][x] = 3;
          } else if (current === 3) {
            // Ash slowly decays to empty ground
            nextGrid[y][x] = Math.random() < 0.25 ? 0 : 3;
          }
        }
      }
      break;
    }

    case 'sand': {
      // For falling sand physics, write into nextGrid dynamically
      // Pre-fill nextGrid with stone cells because stones are completely stationary
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === 2) {
            nextGrid[y][x] = 2; // Stone stays
          }
        }
      }

      // To prevent bias, randomize the order we scan horizontally
      const xIndices = Array.from({ length: width }, (_, i) => i);
      
      // Keep track of which cells in nextGrid are already taken
      const occupied = (x: number, y: number): boolean => {
        if (x < 0 || x >= width || y < 0 || y >= height) return true;
        return nextGrid[y][x] !== 0;
      };

      // Scan bottom-to-top so elements drop correctly
      for (let y = height - 1; y >= 0; y--) {
        // Randomize the horizontal scan direction
        const shuffledX = [...xIndices].sort(() => Math.random() - 0.5);

        for (const x of shuffledX) {
          const current = grid[y][x];

          if (current === 1) {
            // SAND PHYSICS
            if (y === height - 1) {
              // Reached floor
              nextGrid[y][x] = 1;
            } else if (!occupied(x, y + 1)) {
              // Move down directly
              nextGrid[y + 1][x] = 1;
            } else {
              // Diagonals
              const leftFree = !occupied(x - 1, y + 1) && x > 0;
              const rightFree = !occupied(x + 1, y + 1) && x < width - 1;

              if (leftFree && rightFree) {
                // Pick one randomly
                if (Math.random() < 0.5) {
                  nextGrid[y + 1][x - 1] = 1;
                } else {
                  nextGrid[y + 1][x + 1] = 1;
                }
              } else if (leftFree) {
                nextGrid[y + 1][x - 1] = 1;
              } else if (rightFree) {
                nextGrid[y + 1][x + 1] = 1;
              } else {
                // Grounded sand remains
                nextGrid[y][x] = 1;
              }
            }
          } else if (current === 3) {
            // WATER PHYSICS (Flows down, diagonals, or sideways)
            if (y === height - 1) {
              nextGrid[y][x] = 3;
            } else if (!occupied(x, y + 1)) {
              // Fall straight down
              nextGrid[y + 1][x] = 3;
            } else {
              const diagLeftFree = !occupied(x - 1, y + 1) && x > 0;
              const diagRightFree = !occupied(x + 1, y + 1) && x < width - 1;

              if (diagLeftFree && diagRightFree) {
                if (Math.random() < 0.5) {
                  nextGrid[y + 1][x - 1] = 3;
                } else {
                  nextGrid[y + 1][x + 1] = 3;
                }
              } else if (diagLeftFree) {
                nextGrid[y + 1][x - 1] = 3;
              } else if (diagRightFree) {
                nextGrid[y + 1][x + 1] = 3;
              } else {
                // Sideways flow
                const leftFree = !occupied(x - 1, y) && x > 0;
                const rightFree = !occupied(x + 1, y) && x < width - 1;

                if (leftFree && rightFree) {
                  if (Math.random() < 0.5) {
                    nextGrid[y][x - 1] = 3;
                  } else {
                    nextGrid[y][x + 1] = 3;
                  }
                } else if (leftFree) {
                  nextGrid[y][x - 1] = 3;
                } else if (rightFree) {
                  nextGrid[y][x + 1] = 3;
                } else {
                  nextGrid[y][x] = 3; // Blocked on all sides
                }
              }
            }
          }
        }
      }
      break;
    }

    case 'epidemic': {
      const { infection, recovery, mortality } = state.epidemicProb;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const current = grid[y][x];

          if (current === 0) {
            // Susceptible cell: can get infected by 8 neighbors
            let infectionChanceOfContact = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ny = (y + dy + height) % height;
                const nx = (x + dx + width) % width;
                if (grid[ny][nx] === 1) {
                  infectionChanceOfContact++;
                }
              }
            }

            if (infectionChanceOfContact > 0) {
              // Cumulative spreading percentage
              const combinedSpreadProb = 1 - Math.pow(1 - infection, infectionChanceOfContact);
              nextGrid[y][x] = Math.random() < combinedSpreadProb ? 1 : 0;
            } else {
              nextGrid[y][x] = 0;
            }
          } else if (current === 1) {
            // Infected cell: either recovers, dies, or stays infected
            const rollout = Math.random();
            if (rollout < recovery) {
              nextGrid[y][x] = 2; // Immune / Recovered
            } else if (rollout < recovery + mortality) {
              nextGrid[y][x] = 3; // Deceased
            } else {
              nextGrid[y][x] = 1; // Remains infected
            }
          } else {
            // Immune (2) and Deceased (3) are permanent
            nextGrid[y][x] = current;
          }
        }
      }
      break;
    }
  }

  return nextGrid;
}
