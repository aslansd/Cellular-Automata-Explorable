import { ModelType } from '../types';
import { Sparkles, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RulesEditorProps {
  modelType: ModelType;
  lifeRules: { birth: number[]; survival: number[] };
  setLifeRules: (rules: { birth: number[]; survival: number[] }) => void;
  elementaryRule: number;
  setElementaryRule: (rule: number) => void;
  fireProb: { regrowth: number; lightning: number };
  setFireProb: (prob: { regrowth: number; lightning: number }) => void;
  epidemicProb: { infection: number; recovery: number; mortality: number };
  setEpidemicProb: (prob: { infection: number; recovery: number; mortality: number }) => void;
}

export default function RulesEditor({
  modelType,
  lifeRules,
  setLifeRules,
  elementaryRule,
  setElementaryRule,
  fireProb,
  setFireProb,
  epidemicProb,
  setEpidemicProb,
}: RulesEditorProps) {
  
  // Toggles Life birth rule counts
  const toggleLifeBirth = (n: number) => {
    const nextBirth = lifeRules.birth.includes(n)
      ? lifeRules.birth.filter((v) => v !== n)
      : [...lifeRules.birth, n].sort();
    setLifeRules({ ...lifeRules, birth: nextBirth });
  };

  // Toggles Life survival rule counts
  const toggleLifeSurvival = (n: number) => {
    const nextSurvival = lifeRules.survival.includes(n)
      ? lifeRules.survival.filter((v) => v !== n)
      : [...lifeRules.survival, n].sort();
    setLifeRules({ ...lifeRules, survival: nextSurvival });
  };

  // Set bit in Elementary rule (0 to 7)
  const toggleElementaryBit = (bitIndex: number) => {
    const bitValue = (elementaryRule >> bitIndex) & 1;
    let nextRule = elementaryRule;
    if (bitValue === 1) {
      nextRule &= ~(1 << bitIndex); // clear bit
    } else {
      nextRule |= 1 << bitIndex; // set bit
    }
    setElementaryRule(nextRule);
  };

  return (
    <div className="bg-amber-50/50 border border-amber-900/10 rounded-2xl p-5 shadow-sm space-y-4" id="rules-editor">
      <div className="flex items-center gap-2 border-b border-amber-900/10 pb-2">
        <Sparkles className="w-4 h-4 text-amber-700" />
        <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-amber-900/80">
          Simulation Rules & Parameters
        </h3>
      </div>

      {modelType === 'life' && (
        <div className="space-y-4 animation-fade-in text-sm">
          <div>
            <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>👶 Birth Condition</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-mono py-0.5 px-2 rounded-full">
                B{lifeRules.birth.join('')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              An empty cell becomes <b>alive</b> if it has exactly this many neighbors:
            </p>
            <div className="flex gap-1.5 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const active = lifeRules.birth.includes(num);
                return (
                  <button
                    key={`birth-${num}`}
                    onClick={() => toggleLifeBirth(num)}
                    id={`btn-birth-${num}`}
                    className={`flex-1 aspect-square rounded-lg font-mono text-xs font-bold transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>❇️ Survival Condition</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-mono py-0.5 px-2 rounded-full">
                S{lifeRules.survival.join('')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              A living cell <b>stays alive</b> if it has this many neighbors:
            </p>
            <div className="flex gap-1.5 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const active = lifeRules.survival.includes(num);
                return (
                  <button
                    key={`survival-${num}`}
                    onClick={() => toggleLifeSurvival(num)}
                    id={`btn-survival-${num}`}
                    className={`flex-1 aspect-square rounded-lg font-mono text-xs font-bold transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {modelType === 'elementary' && (
        <div className="space-y-4 text-sm" id="elementary-rules-controls">
          <div className="flex items-center justify-between gap-4">
            <label className="font-semibold text-slate-800">Rule Setter (0 - 255):</label>
            <input
              type="number"
              min="0"
              max="255"
              value={elementaryRule}
              id="elementary-input-rule"
              onChange={(e) => setElementaryRule(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 font-mono text-center bg-white border border-slate-200 rounded-lg p-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <span className="font-semibold text-slate-800 block mb-2">Binary Neighborhood Combinations:</span>
            <p className="text-xs text-slate-600 mb-3">
              Click the downward outputs (bottom boxes) to toggle the rule’s binary bits:
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIndex) => {
                const l = (bitIndex >> 2) & 1;
                const m = (bitIndex >> 1) & 1;
                const r = bitIndex & 1;
                const active = ((elementaryRule >> bitIndex) & 1) === 1;

                return (
                  <div
                    key={`neighborhood-${bitIndex}`}
                    className="flex flex-col items-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs"
                  >
                    {/* Visual 3-cell icon */}
                    <div className="flex gap-0.5 justify-center mb-1 scale-90">
                      <div className={`w-3 h-3 rounded-xs border border-slate-700/30 ${l ? 'bg-amber-500' : 'bg-slate-100'}`} />
                      <div className={`w-3 h-3 rounded-xs border border-slate-700/30 ${m ? 'bg-amber-500' : 'bg-slate-100'}`} />
                      <div className={`w-3 h-3 rounded-xs border border-slate-700/30 ${r ? 'bg-amber-500' : 'bg-slate-100'}`} />
                    </div>
                    {/* Bit index indicator */}
                    <div className="text-[9px] text-slate-500 font-mono mb-1">
                      Bit {bitIndex}
                    </div>
                    {/* Toggle button outputs */}
                    <button
                      onClick={() => toggleElementaryBit(bitIndex)}
                      className={`w-full text-center py-1 rounded text-xs font-mono font-bold transition-all ${
                        active
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {active ? '1' : '0'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {modelType === 'fire' && (
        <div className="space-y-4 text-sm" id="fire-rules-controls">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                🌲 Tree Regrowth Rate
              </span>
              <span className="font-mono text-xs text-amber-700">
                {(fireProb.regrowth * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.2"
              step="0.001"
              value={fireProb.regrowth}
              onChange={(e) => setFireProb({ ...fireProb, regrowth: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Probability of sprouts growing in empty dirt. Higher = hyper dense forests.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                ⚡ Random Lightning Strike
              </span>
              <span className="font-mono text-xs text-amber-700">
                {(fireProb.lightning * 100).toFixed(3)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={fireProb.lightning}
              onChange={(e) => setFireProb({ ...fireProb, lightning: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Chance that a lightning strike ignites a green tree spontaneously.
            </p>
          </div>
        </div>
      )}

      {modelType === 'epidemic' && (
        <div className="space-y-4 text-sm" id="epidemic-rules-controls">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-rose-600">
                <AlertTriangle className="w-3.5 h-3.5" /> Transmission Rate
              </span>
              <span className="font-mono text-xs text-rose-700 font-bold">
                {(epidemicProb.infection * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={epidemicProb.infection}
              onChange={(e) => setEpidemicProb({ ...epidemicProb, infection: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Spreading probability from one active red infection to contact neighbors.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-blue-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Healing Probability
              </span>
              <span className="font-mono text-xs text-blue-700 font-bold">
                {(epidemicProb.recovery * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={epidemicProb.recovery}
              onChange={(e) => setEpidemicProb({ ...epidemicProb, recovery: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Recovery rate per step. Higher recovery rates shorten active infection windows.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-800 text-slate-700">
                💀 Fatality Risk
              </span>
              <span className="font-mono text-xs text-slate-700">
                {(epidemicProb.mortality * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.1"
              step="0.005"
              value={epidemicProb.mortality}
              onChange={(e) => setEpidemicProb({ ...epidemicProb, mortality: parseFloat(e.target.value) })}
              className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Risk of active infected cell moving to the deceased black state.
            </p>
          </div>
        </div>
      )}

      {/* Floating explanatory footers for Sandbox instructions */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex gap-2 items-start text-xs">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span className="text-slate-600 leading-relaxed">
          {modelType === 'life' && 'Conway GOL produces structural gliders and blinkers. Try toggling rules slightly (e.g., adding Birth/Survival values) to witness catastrophic explosion or peaceful freezing!'}
          {modelType === 'elementary' && '1D cellular automata create spectacular patterns out of a single seed. Try Rule 90 for perfect Sierpinski triangles, or Rule 110 for complex computing structures!'}
          {modelType === 'fire' && 'Green trees are flammable 🌲. Red is active burning 🔥. Grey values are charcoal charred ashes 🔲. Sparks hit randomly but propagate rapidly!'}
          {modelType === 'sand' && 'This is a falling block physics toy. Yellow sand drops, slides, and stacks 🟡. Blue water drops and runs sideways inside lakes 💧. Slate grey is heavy rock barrier 🪨.'}
          {modelType === 'epidemic' && 'Susceptible (Healthy Green) cells infection risk doubles for each surrounding sick (Red) neighbors. Help them recover (Blue) or buffer infection flow!'}
        </span>
      </div>
    </div>
  );
}
