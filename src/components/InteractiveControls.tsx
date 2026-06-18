import { ModelType } from '../types';
import { Play, Pause, SkipForward, Trash2, RotateCcw, Palette, Zap } from 'lucide-react';

interface InteractiveControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onClear: () => void;
  onReset: () => void;
  speedMs: number;
  onSpeedChange: (speed: number) => void;
  modelType: ModelType;
  selectedBrush: number;
  setSelectedBrush: (brush: number) => void;
  onLoadTemplate: (templateName: string) => void;
  stepCount: number;
}

export default function InteractiveControls({
  isRunning,
  onTogglePlay,
  onStep,
  onClear,
  onReset,
  speedMs,
  onSpeedChange,
  modelType,
  selectedBrush,
  setSelectedBrush,
  onLoadTemplate,
  stepCount,
}: InteractiveControlsProps) {
  
  // Custom palettes for brushes depending on model
  const getBrushes = () => {
    switch (modelType) {
      case 'life':
      case 'elementary':
        return [
          { value: 1, label: 'Living Cell', colorClass: 'bg-indigo-600 text-white', emoji: '❇️' },
          { value: 0, label: 'Erase / Dead', colorClass: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', emoji: '🔲' }
        ];
      case 'fire':
        return [
          { value: 1, label: 'Sprout Tree', colorClass: 'bg-emerald-600 text-white', emoji: '🌲' },
          { value: 2, label: 'Spawn Spark', colorClass: 'bg-rose-500 text-white', emoji: '🔥' },
          { value: 3, label: 'Char with Ash', colorClass: 'bg-slate-600 text-white', emoji: '💨' },
          { value: 0, label: 'Erase Ground', colorClass: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', emoji: '🔲' }
        ];
      case 'sand':
        return [
          { value: 1, label: 'Golden Sand', colorClass: 'bg-yellow-500 text-white', emoji: '🟡' },
          { value: 3, label: 'Slippery Water', colorClass: 'bg-blue-500 text-white', emoji: '💧' },
          { value: 2, label: 'Hard Slate Stone', colorClass: 'bg-slate-600 text-white', emoji: '🪨' },
          { value: 0, label: 'Vaporize / Air', colorClass: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', emoji: '🔲' }
        ];
      case 'epidemic':
        return [
          { value: 0, label: 'Susceptible Cell', colorClass: 'bg-green-500 text-white', emoji: '🟢' },
          { value: 1, label: 'Active Infected', colorClass: 'bg-rose-500 text-white', emoji: '🔴' },
          { value: 2, label: 'Vaccinated (Immune)', colorClass: 'bg-blue-500 text-white', emoji: '🔵' },
          { value: 3, label: 'Erase / Dead', colorClass: 'bg-slate-700 text-white', emoji: '⚫' }
        ];
    }
  };

  const currentBrushes = getBrushes();

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg space-y-6" id="interactive-controls-panel">
      {/* Simulation status counter */}
      <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 font-sans">
            Tick Generation
          </span>
        </div>
        <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-slate-950 text-indigo-400 font-bold">
          {stepCount}
        </span>
      </div>

      {/* Simulator playback tools */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">
          Simulator Playback
        </span>
        <div className="grid grid-cols-4 gap-2">
          {/* Play / pause */}
          <button
            onClick={onTogglePlay}
            id="control-play-pause-btn"
            className={`col-span-2 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950 text-slate-950" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Play Game
              </>
            )}
          </button>

          {/* Stepper */}
          <button
            onClick={onStep}
            disabled={isRunning}
            id="control-step-btn"
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 flex flex-col items-center justify-center gap-1 font-bold text-xs disabled:opacity-40 transition-transform active:scale-95 cursor-pointer"
            title="Step 1 Frame Forward"
          >
            <SkipForward className="w-4 h-4" />
            <span>Step</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            id="control-reset-btn"
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 flex flex-col items-center justify-center gap-1 font-bold text-xs transition-transform active:scale-95 cursor-pointer"
            title="Restore Default Presets"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Clear block */}
        <button
          onClick={onClear}
          id="control-clear-btn"
          className="w-full py-2 bg-slate-950/50 hover:bg-rose-950 hover:text-rose-200 text-slate-400 rounded-xl border border-slate-800 hover:border-rose-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Erase Entire Grid
        </button>
      </div>

      {/* Brush Paint Selectors */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          <Palette className="w-3.5 h-3.5" />
          <span>Interactive Paintbrush</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Select a tool below, then tap/drag on the cellular grid canvas to paint patterns directly:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {currentBrushes.map((brush) => {
            const active = selectedBrush === brush.value;
            return (
              <button
                key={`brush-${brush.value}`}
                onClick={() => setSelectedBrush(brush.value)}
                id={`brush-selector-${brush.value}`}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer border ${
                  active
                    ? 'bg-slate-100 text-slate-900 shadow-md scale-102 border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-transparent hover:bg-slate-750'
                }`}
              >
                <span className="text-sm scale-110 shrink-0">{brush.emoji}</span>
                <span className="truncate">{brush.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed dial */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          <span>Speed: {speedMs}ms</span>
          <span className="text-[10px] text-indigo-400 uppercase tracking-tight">
            {speedMs <= 50 ? 'Hyperspeed ⚡' : speedMs > 400 ? 'Slow Motion 🐌' : 'Standard ⏱️'}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="800"
          step="10"
          value={speedMs}
          id="control-speed-range"
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
        />
      </div>

      {/* Templates trigger bar (Specific to Life and sandbox setups) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 block">
          Spawn Grid Templates
        </span>
        <div className="flex flex-wrap gap-1.5">
          {modelType === 'life' && (
            <>
              <button
                onClick={() => onLoadTemplate('glider')}
                className="text-[10px] bg-slate-800 hover:bg-indigo-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-indigo-400 cursor-pointer"
              >
                🚀 Glider
              </button>
              <button
                onClick={() => onLoadTemplate('pulsar')}
                className="text-[10px] bg-slate-800 hover:bg-indigo-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-indigo-400 cursor-pointer"
              >
                🎚️ Pulsar Bumper
              </button>
              <button
                onClick={() => onLoadTemplate('beacon')}
                className="text-[10px] bg-slate-800 hover:bg-indigo-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-indigo-400 cursor-pointer"
              >
                💡 Beacon
              </button>
              <button
                onClick={() => onLoadTemplate('random')}
                className="text-[10px] bg-slate-800 hover:bg-indigo-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-indigo-400 cursor-pointer"
              >
                🎲 Sparse Dust
              </button>
            </>
          )}

          {modelType === 'fire' && (
            <>
              <button
                onClick={() => onLoadTemplate('fire_sparse')}
                className="text-[10px] bg-slate-800 hover:bg-emerald-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-emerald-400 cursor-pointer"
              >
                🌲 Random Wood
              </button>
              <button
                onClick={() => onLoadTemplate('fire_dense')}
                className="text-[10px] bg-slate-800 hover:bg-emerald-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-emerald-400 cursor-pointer"
              >
                🌳 Packed Wilderness
              </button>
            </>
          )}

          {modelType === 'sand' && (
            <>
              <button
                onClick={() => onLoadTemplate('sand_hourglass')}
                className="text-[10px] bg-slate-800 hover:bg-amber-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-amber-400 cursor-pointer"
              >
                ⏳ Hourglass Base
              </button>
              <button
                onClick={() => onLoadTemplate('sand_hills')}
                className="text-[10px] bg-slate-800 hover:bg-amber-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-amber-400 cursor-pointer"
              >
                ⛰️ Steeps and Walls
              </button>
            </>
          )}

          {modelType === 'epidemic' && (
            <>
              <button
                onClick={() => onLoadTemplate('epidemic_barriers')}
                className="text-[10px] bg-slate-800 hover:bg-blue-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-blue-400 cursor-pointer"
              >
                🧱 Firewall Dividers
              </button>
              <button
                onClick={() => onLoadTemplate('epidemic_free')}
                className="text-[10px] bg-slate-800 hover:bg-blue-950 font-bold text-slate-300 py-1 px-2.5 rounded-lg border border-slate-700/60 hover:text-blue-400 cursor-pointer"
              >
                🟢 Unvaccinated Grid
              </button>
            </>
          )}

          {modelType === 'elementary' && (
            <div className="text-[10px] text-slate-500 font-mono italic">
              (No templates needed, rules scroll dynamically!)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
