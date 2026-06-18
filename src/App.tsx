import { useState, useEffect } from 'react';
import { CellularAutomataState, ModelType, Lesson } from './types';
import { LESSONS } from './data/lessons';
import { createEmptyGrid, getPresetGrid, computeNextStep } from './utils/simulation';
import Grid from './components/Grid';
import ChapterView from './components/ChapterView';
import InteractiveControls from './components/InteractiveControls';
import RulesEditor from './components/RulesEditor';
import { Heart, RefreshCw, BarChart2, Shield } from 'lucide-react';

const GRID_WIDTH = 60;
const GRID_HEIGHT = 30;

export default function App() {
  // Navigation State
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [isSandbox, setIsSandbox] = useState<boolean>(false);
  
  // Custom draw actions counter
  const [drawHistoryCount, setDrawHistoryCount] = useState<number>(0);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  // Core Simulation State
  const [simulation, setSimulation] = useState<CellularAutomataState>({
    grid: getPresetGrid('life', GRID_WIDTH, GRID_HEIGHT),
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    stepCount: 0,
    isRunning: false,
    speedMs: 120, // Nice balance
    modelType: 'life',
    lifeRules: { birth: [3], survival: [2, 3] },
    elementaryRule: 30,
    fireProb: { regrowth: 0.015, lightning: 0.001 },
    epidemicProb: { infection: 0.35, recovery: 0.12, mortality: 0.012 },
  });

  const [selectedBrush, setSelectedBrush] = useState<number>(1);

  // Active Lesson
  const currentLesson: Lesson = LESSONS[currentLessonIndex];

  // Initialize/Load a lesson structure
  const loadLessonIndex = (index: number) => {
    const lesson = LESSONS[index];
    const newGrid = getPresetGrid(lesson.modelType, GRID_WIDTH, GRID_HEIGHT);
    
    setSimulation((prev) => ({
      ...prev,
      grid: newGrid,
      stepCount: 0,
      isRunning: false,
      modelType: lesson.modelType,
      elementaryRule: lesson.id === 'elementary' ? 30 : prev.elementaryRule,
    }));

    // Reset brushes & completions
    setSelectedBrush(1);
    setIsSandbox(false);
    setChallengeCompleted(false);
    setDrawHistoryCount(0);
  };

  // Switch to Sandbox mode
  const loadSandboxMode = () => {
    setIsSandbox(true);
    setChallengeCompleted(false);
    setSimulation((prev) => ({
      ...prev,
      grid: getPresetGrid('life', GRID_WIDTH, GRID_HEIGHT),
      stepCount: 0,
      isRunning: false,
      modelType: 'life',
    }));
    setSelectedBrush(1);
  };

  // Load custom templates triggers
  const handleLoadTemplate = (templateName: string) => {
    const freshGrid = createEmptyGrid(GRID_WIDTH, GRID_HEIGHT);
    const midX = Math.floor(GRID_WIDTH / 2);
    const midY = Math.floor(GRID_HEIGHT / 2);

    switch (templateName) {
      case 'glider':
        freshGrid[4][10] = 1;
        freshGrid[5][11] = 1;
        freshGrid[6][9] = 1;
        freshGrid[6][10] = 1;
        freshGrid[6][11] = 1;
        break;

      case 'pulsar': {
        const cx = midX;
        const cy = midY;
        const pts = [-6, -1, 1, 6];
        pts.forEach((o) => {
          // Horizontal lines
          for (let x = cx - 4; x <= cx + 4; x++) {
            if (x === cx - 1 || x === cx || x === cx + 1) continue;
            freshGrid[cy + o][x] = 1;
          }
          // Vertical lines
          for (let y = cy - 4; y <= cy + 4; y++) {
            if (y === cy - 1 || y === cy || y === cy + 1) continue;
            freshGrid[y][cx + o] = 1;
          }
        });
        break;
      }

      case 'beacon':
        freshGrid[12][20] = 1;
        freshGrid[12][21] = 1;
        freshGrid[13][20] = 1;
        freshGrid[14][23] = 1;
        freshGrid[15][22] = 1;
        freshGrid[15][23] = 1;
        break;

      case 'random':
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.22) {
              freshGrid[y][x] = 1;
            }
          }
        }
        break;

      case 'fire_sparse':
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.42) freshGrid[y][x] = 1;
          }
        }
        freshGrid[midY][midX] = 2; // Starter spark
        break;

      case 'fire_dense':
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.78) freshGrid[y][x] = 1;
          }
        }
        freshGrid[midY][midX] = 2; // Starter spark
        break;

      case 'sand_hourglass':
        // Funnel walls
        for (let x = 0; x < GRID_WIDTH; x++) {
          const funnelY = Math.floor(GRID_HEIGHT * 0.5) + Math.abs(x - midX) * 0.4;
          if (funnelY < GRID_HEIGHT - 3 && Math.abs(x - midX) > 2) {
            freshGrid[Math.floor(funnelY)][x] = 2; // Stone funnel
          }
        }
        // Sand pile floating on top
        for (let y = 2; y < 10; y++) {
          for (let x = midX - 8; x <= midX + 8; x++) {
            if (Math.random() < 0.8) freshGrid[y][x] = 1;
          }
        }
        break;

      case 'sand_hills':
        // Steeps
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (y === Math.floor(x * 0.45) + 6 && x < midX - 4) {
              freshGrid[y][x] = 2;
            }
            if (y === Math.floor((GRID_WIDTH - x) * 0.3) + 12 && x > midX + 3) {
              freshGrid[y][x] = 2;
            }
          }
        }
        // Water on high plateau, sand on low
        for (let y = 1; y < 5; y++) {
          for (let x = 2; x < 9; x++) {
            freshGrid[y][x] = 3; // Water
          }
        }
        for (let y = 1; y < 7; y++) {
          for (let x = GRID_WIDTH - 12; x < GRID_WIDTH - 2; x++) {
            freshGrid[y][x] = 1; // Sand
          }
        }
        break;

      case 'epidemic_barriers':
        // Populate random susceptible
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.88) {
              freshGrid[y][x] = 0; // Susceptible
            }
          }
        }
        // Immunized fence columns separating center
        for (let y = 0; y < GRID_HEIGHT; y++) {
          if (y % 4 !== 2) {
            freshGrid[y][midX - 10] = 2; // Inoculated walls
            freshGrid[y][midX + 10] = 2;
          }
        }
        // Spawn virus on the left side
        freshGrid[midY][5] = 1;
        break;

      case 'epidemic_free':
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            freshGrid[y][x] = 0; // All healthy Susceptible
          }
        }
        freshGrid[midY][midX] = 1; // Patient Zero in middle
        break;
    }

    setSimulation((prev) => ({
      ...prev,
      grid: freshGrid,
      stepCount: 0,
      isRunning: false,
    }));
  };

  // Clock runner trigger
  useEffect(() => {
    if (!simulation.isRunning) return;

    const timer = setInterval(() => {
      setSimulation((prev) => ({
        ...prev,
        grid: computeNextStep(prev),
        stepCount: prev.stepCount + 1,
      }));
    }, simulation.speedMs);

    return () => clearInterval(timer);
  }, [simulation.isRunning, simulation.speedMs]);

  // Check interactive lesson challenge completion conditions
  useEffect(() => {
    if (isSandbox) return;
    
    const completedNow = currentLesson.checkCompletion(simulation, drawHistoryCount);
    if (completedNow) {
      setChallengeCompleted(true);
    }
  }, [simulation, drawHistoryCount, currentLesson, isSandbox]);

  // Handle cell painter inputs
  const handleCellClick = (x: number, y: number, value: number) => {
    setSimulation((prev) => {
      const nextGrid = prev.grid.map((row) => [...row]);
      // In 1D elementary, users paint exclusively on the bottom generating line
      if (prev.modelType === 'elementary') {
        nextGrid[prev.height - 1][x] = nextGrid[prev.height - 1][x] === 1 ? 0 : 1;
      } else {
        // Normal paint mode
        nextGrid[y][x] = value;
      }
      return { ...prev, grid: nextGrid };
    });
    setDrawHistoryCount((prev) => prev + 1);
  };

  // Compute active stats on the panel
  const getSimStatistics = () => {
    const flat = simulation.grid.flat();
    const total = flat.length;

    switch (simulation.modelType) {
      case 'life': {
        const alive = flat.filter((c) => c === 1).length;
        const pct = ((alive / total) * 100).toFixed(1);
        return {
          title: 'Conway Ecosystem',
          metrics: [
            { label: 'Living Cells', value: alive, color: 'text-indigo-600', widthPct: (alive / total) * 300 },
            { label: 'Density', value: `${pct}%`, color: 'text-slate-600', widthPct: 50 },
          ],
        };
      }
      case 'elementary': {
        const active = flat.filter((c) => c === 1).length;
        return {
          title: 'Fractal Generation',
          metrics: [
            { label: 'Active Memory Rows', value: simulation.stepCount, color: 'text-amber-500', widthPct: 150 },
            { label: 'Active Cells', value: active, color: 'text-slate-600', widthPct: (active / total) * 300 },
          ],
        };
      }
      case 'fire': {
        const green = flat.filter((c) => c === 1).length;
        const fire = flat.filter((c) => c === 2).length;
        const ash = flat.filter((c) => c === 3).length;
        return {
          title: 'Forest Fires Feedbacks',
          metrics: [
            { label: '🌲 Green Woods', value: green, color: 'text-emerald-600', widthPct: (green / total) * 100 },
            { label: '🔥 Wildfire Blazes', value: fire, color: 'text-rose-500', widthPct: (fire / total) * 100 },
            { label: '💨 Charred Ash', value: ash, color: 'text-zinc-500', widthPct: (ash / total) * 100 },
          ],
        };
      }
      case 'sand': {
        const sand = flat.filter((c) => c === 1).length;
        const water = flat.filter((c) => c === 3).length;
        const stone = flat.filter((c) => c === 2).length;
        return {
          title: 'Sandpile Masses',
          metrics: [
            { label: '🟡 Sand Grains', value: sand, color: 'text-yellow-600', widthPct: (sand / total) * 100 },
            { label: '💧 Water drops', value: water, color: 'text-sky-600', widthPct: (water / total) * 100 },
            { label: '🪨 Steady Slates', value: stone, color: 'text-slate-500', widthPct: (stone / total) * 100 },
          ],
        };
      }
      case 'epidemic': {
        const s = flat.filter((c) => c === 0).length;
        const i = flat.filter((c) => c === 1).length;
        const r = flat.filter((c) => c === 2).length;
        const d = flat.filter((c) => c === 3).length;
        return {
          title: 'Outbreak Viral Curve',
          metrics: [
            { label: 'Susceptible (Healthy)', value: s, color: 'text-emerald-500', widthPct: (s / total) * 100 },
            { label: 'Infected (Active)', value: i, color: 'text-rose-500', widthPct: (i / total) * 100 },
            { label: 'Immune/Recovered', value: r, color: 'text-blue-500', widthPct: (r / total) * 100 },
            { label: 'Deceased', value: d, color: 'text-slate-500', widthPct: (d / total) * 100 },
          ],
        };
      }
    }
  };

  const activeStats = getSimStatistics();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 pb-12 antialiased" id="cellular-automata-root-element">
      {/* Decorative Warm Banner */}
      <header className="border-b border-slate-200 bg-white shadow-3xs max-w-7xl mx-auto mt-4 px-6 py-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              Cellular Automata Explorable
            </h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-widest leading-none">
              v1.0 Play
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            A playful guide into emergent complexity, system feedback loops and 1D/2D local physics structures. Inspired by exploration philosophies of Nicky Case.
          </p>
        </div>

        {/* Story Selector Map / Progress badging */}
        <div className="flex flex-wrap items-center gap-1.5" id="story-navigation-row">
          {LESSONS.map((chap, idx) => {
            const isActive = currentLessonIndex === idx && !isSandbox;
            return (
              <button
                key={`chapter-badge-${chap.id}`}
                onClick={() => loadLessonIndex(idx)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all transition-transform active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow shadow-slate-900/30 ring-2 ring-indigo-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
          
          <button
            onClick={loadSandboxMode}
            className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
              isSandbox
                ? 'bg-amber-500 text-white shadow ring-2 ring-amber-500/30'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            🔬 Sandbox
          </button>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (Narrative and rules panel) - lg:span-5 */}
        <section className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Narrative Story Card */}
          <ChapterView
            currentLesson={currentLesson}
            currentLessonIndex={currentLessonIndex}
            totalLessons={LESSONS.length}
            challengeCompleted={challengeCompleted}
            isSandbox={isSandbox}
            onSelectSandbox={loadSandboxMode}
            onNextLesson={() => {
              if (currentLessonIndex === LESSONS.length - 1) {
                loadSandboxMode();
              } else {
                loadLessonIndex(Math.min(LESSONS.length - 1, currentLessonIndex + 1));
              }
            }}
            onPrevLesson={() => {
              if (isSandbox) {
                setIsSandbox(false);
                setCurrentLessonIndex(LESSONS.length - 1);
              } else {
                loadLessonIndex(Math.max(0, currentLessonIndex - 1));
              }
            }}
            onSelectModelPreset={handleLoadTemplate}
          />

          {/* Model specific Rules editor */}
          <RulesEditor
            modelType={simulation.modelType}
            lifeRules={simulation.lifeRules}
            setLifeRules={(rules) => setSimulation({ ...simulation, lifeRules: rules })}
            elementaryRule={simulation.elementaryRule}
            setElementaryRule={(rule) => setSimulation({ ...simulation, elementaryRule: rule })}
            fireProb={simulation.fireProb}
            setFireProb={(prob) => setSimulation({ ...simulation, fireProb: prob })}
            epidemicProb={simulation.epidemicProb}
            setEpidemicProb={(prob) => setSimulation({ ...simulation, epidemicProb: prob })}
          />
        </section>

        {/* Right Column (Playback grid and settings) - lg:span-7 */}
        <section className="lg:col-span-7 space-y-6">
          {/* Canvas grid card container */}
          <div className="bg-white border-2 border-slate-700/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📺</span>
                <div className="text-left">
                  <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wide leading-tight">
                    {simulation.modelType === 'life' && '2D Conway Life Grid'}
                    {simulation.modelType === 'elementary' && '1D Time History Waterfall'}
                    {simulation.modelType === 'fire' && 'Wildfire Ignition Board'}
                    {simulation.modelType === 'sand' && 'Falling Sand sandbox'}
                    {simulation.modelType === 'epidemic' && 'Contagion Propagation Board'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {simulation.modelType === 'elementary' 
                      ? 'Draw to activate cells on the BOTTOM row, then let time scroll downwards' 
                      : 'Draw or paint directly with your cursor on the cellular blocks'}
                  </span>
                </div>
              </div>

              {/* Model selection badging */}
              <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-sans font-bold text-xs uppercase tracking-tight">
                {simulation.modelType} model
              </div>
            </div>

            {/* Simulated Active Grid Component */}
            <div className="aspect-ratio p-1 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              <Grid
                grid={simulation.grid}
                modelType={simulation.modelType}
                selectedBrush={selectedBrush}
                onCellClick={handleCellClick}
              />
            </div>

            {/* Quick model metrics dashboard */}
            {activeStats && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3" id="sim-statistics-panel">
                <div className="flex items-center gap-1 pb-1 border-b border-slate-200">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs uppercase font-sans font-semibold tracking-wider text-slate-700">
                    {activeStats.title} (Population Feedback Loops)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {activeStats.metrics.map((metric, mi) => (
                    <div key={`metric-${mi}`} className="space-y-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight block">
                        {metric.label}
                      </span>
                      <span className={`text-base font-extrabold font-mono ${metric.color}`}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Herd immunity vaccination visualizer matching standard flattened-curve graphs */}
                {simulation.modelType === 'epidemic' && (
                  <div className="space-y-1.5 pt-1.5">
                    <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase justify-between flex">
                      <span>Flatten the contagion curve!</span>
                      <span>Target: quarantine outbreaks early</span>
                    </span>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                      {(() => {
                        const total = simulation.grid.flat().length;
                        const s = (simulation.grid.flat().filter((cell) => cell === 0).length / total) * 100;
                        const i = (simulation.grid.flat().filter((cell) => cell === 1).length / total) * 100;
                        const r = (simulation.grid.flat().filter((cell) => cell === 2).length / total) * 100;
                        const d = (simulation.grid.flat().filter((cell) => cell === 3).length / total) * 100;
                        return (
                          <>
                            <div style={{ width: `${s}%` }} className="bg-green-500 transition-all duration-150" title="Susceptible" />
                            <div style={{ width: `${i}%` }} className="bg-rose-500 transition-all duration-150 animate-pulse" title="Infected" />
                            <div style={{ width: `${r}%` }} className="bg-blue-500 transition-all duration-150" title="Immune / Vac" />
                            <div style={{ width: `${d}%` }} className="bg-slate-700 transition-all duration-150" title="Deceased" />
                          </>
                        );
                      })()}
                    </div>
                    {/* Tiny vaccine info */}
                    <p className="text-[9px] text-slate-400 italic">
                      💡 Legend: Green = Healthy host, Red = Infected active wave, Blue = Vaccinated herd immunity, Black = Deceased cells.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive controls (Play/pause, clear, speed, brush picker) */}
          <InteractiveControls
            isRunning={simulation.isRunning}
            onTogglePlay={() => {
              setSimulation((prev) => ({ ...prev, isRunning: !prev.isRunning }));
            }}
            onStep={() => {
              setSimulation((prev) => ({
                ...prev,
                grid: computeNextStep(prev),
                stepCount: prev.stepCount + 1,
              }));
            }}
            onReset={() => {
              if (isSandbox) {
                setSimulation((prev) => ({
                  ...prev,
                  grid: getPresetGrid(prev.modelType, GRID_WIDTH, GRID_HEIGHT),
                  stepCount: 0,
                  isRunning: false,
                }));
              } else {
                loadLessonIndex(currentLessonIndex);
              }
            }}
            onClear={() => {
              setSimulation((prev) => ({
                ...prev,
                grid: createEmptyGrid(GRID_WIDTH, GRID_HEIGHT),
                stepCount: 0,
                isRunning: false,
              }));
            }}
            speedMs={simulation.speedMs}
            onSpeedChange={(speed) => {
              setSimulation((prev) => ({ ...prev, speedMs: speed }));
            }}
            modelType={simulation.modelType}
            selectedBrush={selectedBrush}
            setSelectedBrush={setSelectedBrush}
            onLoadTemplate={handleLoadTemplate}
            stepCount={simulation.stepCount}
          />
        </section>
      </main>

      {/* Decorative Explorable Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> honoring the Interactive Explanation craft of{' '}
          <a
            href="https://ncase.me/"
            target="_blank"
            rel="noreferrer"
            className="font-bold underline text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Nicky Case
          </a>
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed max-w-lg mx-auto">
          Cellular automata are idealized mathematical worlds where space is discrete, time moves in distinct ticks, and complex, self-organizing organic shapes flow strictly from adjacent neighbor feedback loops.
        </p>
      </footer>
    </div>
  );
}
