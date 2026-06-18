import { Lesson } from '../types';
import { ArrowLeft, ArrowRight, Play, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChapterViewProps {
  currentLesson: Lesson;
  currentLessonIndex: number;
  totalLessons: number;
  challengeCompleted: boolean;
  onNextLesson: () => void;
  onPrevLesson: () => void;
  onSelectSandbox: () => void;
  isSandbox: boolean;
  onSelectModelPreset: (presetName: string) => void;
}

export default function ChapterView({
  currentLesson,
  currentLessonIndex,
  totalLessons,
  challengeCompleted,
  onNextLesson,
  onPrevLesson,
  onSelectSandbox,
  isSandbox,
  onSelectModelPreset,
}: ChapterViewProps) {
  
  return (
    <div className="bg-white border-2 border-slate-700/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="chapter-narrative-view">
      <div className="space-y-4">
        {/* Navigation & Badge headers */}
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrevLesson}
              disabled={isSandbox ? false : currentLessonIndex === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-transform active:scale-95 cursor-pointer"
              title="Previous Lesson"
              id="chapter-prev-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-700 px-2">
              {isSandbox ? '🔬 Infinite Sandbox' : `Chapter ${currentLessonIndex + 1} / ${totalLessons}`}
            </span>
            <button
              onClick={onNextLesson}
              disabled={isSandbox}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-transform active:scale-95 cursor-pointer"
              title="Next Lesson"
              id="chapter-next-btn"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onSelectSandbox}
            className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isSandbox
                ? 'bg-amber-500 text-white shadow shadow-amber-500/20'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            id="chapter-sandbox-mode-toggle"
          >
            <Layers className="w-3.5 h-3.5" />
            Sandbox Mode
          </button>
        </div>

        {/* Narrative Title Section */}
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-500">
            {isSandbox ? 'Playground Lab' : currentLesson.badge}
          </span>
          <h2 className="text-2xl font-sans font-bold text-slate-900 leading-tight">
            {isSandbox ? 'Welcome to the Sandbox!' : currentLesson.title}
          </h2>
          <h4 className="text-xs font-medium text-slate-500 italic">
            {isSandbox ? 'No limitations, create any cellular force of nature.' : currentLesson.subtitle}
          </h4>
        </div>

        {/* Dynamic Story telling Paragraphs */}
        <div className="space-y-3 leading-relaxed text-sm text-slate-600">
          {isSandbox ? (
            <>
              <p>
                In <b>Sandbox Mode</b>, the safety wheels are off! Feel free to pick any model, draw giant configurations with the click-and-drag brushes, and custom shape the cellular properties.
              </p>
              <p>
                Experimenting is the best way to uncover emergency behavior: set the forest fire to burn everything, let sand accumulate infinite sandcastles, or adjust epidemic parameters to simulate standard containment scenarios. Let your imagination run wild!
              </p>
            </>
          ) : (
            currentLesson.paragraphs.map((p, idx) => (
              <p key={`para-${idx}`} className="transition-opacity duration-200">
                {p}
              </p>
            ))
          )}
        </div>

        {/* Challenge Goal Panel */}
        {!isSandbox && currentLesson.challengeTitle && (
          <div className="relative mt-4 bg-amber-50/70 border border-amber-900/15 rounded-xl p-4 overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-sans font-bold text-xs uppercase tracking-wider text-amber-900/70 flex items-center gap-1.5">
                🎯 CHALLENGE: {currentLesson.challengeTitle}
              </h5>
              
              <AnimatePresence mode="wait">
                {challengeCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-1 bg-emerald-100 text-emerald-700 py-0.5 px-2.5 rounded-full text-[10px] font-bold shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-100" />
                    Unlocked
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-600 py-0.5 px-2.5 rounded-full text-[10px] font-bold">
                    <Play className="w-3.5 h-3.5 rotate-0" />
                    Active
                  </div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans mb-2">
              {currentLesson.challengeInstruction}
            </p>

            {/* Hint Box */}
            <div className="bg-white/80 rounded-lg p-2.5 border border-amber-900/10 text-[11px] leading-relaxed text-slate-600 flex items-center gap-1.5 shadow-2xs">
              <span className="font-mono font-bold text-amber-700">Guide:</span> 
              <span>{currentLesson.challengeGoalText}</span>
            </div>

            {/* Quick preset trigger inside lesson */}
            {currentLesson.modelPreset && (
              <button
                onClick={() => onSelectModelPreset(currentLesson.modelPreset || '')}
                className="mt-2 text-[10px] bg-slate-900 hover:bg-indigo-600 text-white font-mono font-bold py-1 px-2.5 rounded-md flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Spawn Starting Layout
              </button>
            )}

            {/* Celebration Sparkles overlay */}
            {challengeCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-x-0 bottom-0 top-0 bg-emerald-500/5 backdrop-blur-2xs flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="bg-emerald-600 text-white font-sans font-bold text-xs py-1 px-4 rounded-full shadow-lg border-2 border-white animate-bounce">
                  🌟 Challenge Mastered!
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Narrative Footer navigation controls */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onPrevLesson}
          disabled={isSandbox ? false : currentLessonIndex === 0}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {isSandbox ? (
          <button
            onClick={() => onPrevLesson()}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            Go to Story List
          </button>
        ) : (
          <button
            onClick={onNextLesson}
            disabled={currentLessonIndex === totalLessons - 1 && !isSandbox}
            className={`text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              challengeCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow shadow-emerald-500/20'
                : 'bg-slate-900 hover:bg-indigo-600 text-white'
            }`}
          >
            {currentLessonIndex === totalLessons - 1 ? 'Go to Sandbox' : 'Next Chapter'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
