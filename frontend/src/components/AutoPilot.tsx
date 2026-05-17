import React, { useState, useEffect, useCallback } from 'react';
import { useCredipro } from '../context/CrediproContext';

// ---------------------------------------------------------------------------
// Walkthrough steps — narrate the demo flow
// ---------------------------------------------------------------------------
const STEPS = [
  {
    id: 'intro',
    title: '👋 Welcome to Credipro',
    body: 'Credipro is a privacy-preserving lending protocol built on Midnight. This guided tour walks you through a full loan request and oracle approval cycle.',
    hint: 'Press → or N to advance, ← or P to go back. Press Esc to close.',
    target: null,
  },
  {
    id: 'pool',
    title: '📊 Pool Parameters',
    body: 'The lending pool shows live parameters: TVL, max LTV, minimum credit score, and the maximum loan amount your wallet is eligible to request.',
    hint: 'Scroll down to see the Pool Parameters card.',
    target: null,
  },
  {
    id: 'preset',
    title: '💡 Choose a Loan Preset',
    body: 'Click "Quick Presets" to select a realistic loan scenario — micro, standard, business, or enterprise. The form auto-fills with sensible defaults.',
    hint: 'Try the "Standard — 5,000 ADA / 180 days" preset.',
    target: 'loan-request-submit',
  },
  {
    id: 'submit',
    title: '🔐 ZK Proof Generation',
    body: 'Clicking "Request Loan" triggers a multi-step flow: ZK witness generation, circuit verification, ledger broadcast, and indexer settlement — all with live progress indicators.',
    hint: 'Click "Request Loan" and watch each step animate.',
    target: 'loan-request-submit',
  },
  {
    id: 'oracle-id',
    title: '🔍 Oracle Voting — Enter Loan ID',
    body: 'Paste the Loan ID returned after submission into the Oracle Voting Panel. The panel validates the format (0x + 64 hex chars) in real time.',
    hint: 'Scroll down to the "Oracle Voting Panel" section.',
    target: 'oracle-loan-id',
  },
  {
    id: 'vote',
    title: '🗳 Cast Oracle Votes',
    body: 'Each oracle member can vote independently. The consensus progress bar updates with each vote. ≥ ⅔ of members must approve before slashing is unlocked.',
    hint: 'Click each oracle member\'s "Vote as …" button.',
    target: null,
  },
  {
    id: 'slash',
    title: '⚡ Trigger Slashing',
    body: 'Once consensus is reached, the "Trigger Slashing" button appears. This executes an on-chain penalty marking the loan as defaulted.',
    hint: 'Trigger slashing and observe the result card.',
    target: 'oracle-trigger-slash',
  },
  {
    id: 'done',
    title: '✅ Demo Complete',
    body: 'You\'ve seen the full lifecycle: loan request → ZK proof → oracle consensus → on-chain slashing. This is Credipro — privacy-first DeFi on Midnight.',
    hint: 'Press Esc or click × to close the walkthrough.',
    target: null,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AutoPilot: React.FC = () => {
  const { isDemoMode } = useCredipro();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const totalSteps = STEPS.length;
  const current = STEPS[step];

  // ---- Open/close ----
  const close = useCallback(() => { setOpen(false); setStep(0); }, []);
  const launch = useCallback(() => { setOpen(true); setStep(0); }, []);

  // ---- Navigation ----
  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  // ---- Keyboard handler ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Global shortcut: G + T to open tour
      if (!open && e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        launch();
        return;
      }
      if (!open) return;

      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') next();
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev, launch]);

  // ---- Scroll target element into view ----
  useEffect(() => {
    if (!open || !current.target) return;
    const el = document.getElementById(current.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }
  }, [open, step, current.target]);

  if (!isDemoMode || !visible) return null;

  return (
    <>
      {/* ---- Floating launcher pill (Widget 4 match) ---- */}
      {!open && (
        <div className="fixed bottom-8 right-8 z-[70] animate-fade-in">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-2xl border-primary/30 max-w-[280px]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center text-on-secondary pulse-dot relative flex-shrink-0 shadow-lg shadow-secondary/20">
              <span className="material-symbols-outlined text-lg">neurology</span>
            </div>
            <div className="flex-1 cursor-pointer" onClick={launch}>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-label-md font-label-md text-on-surface m-0 font-bold">AutoPilot AI</p>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 font-mono-data">Ctrl+T</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-tight m-0">Click to launch interactive guided tour of ZK lending & oracle consensus.</p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="p-1 hover:bg-white/10 rounded-full self-start transition-colors text-on-surface-variant hover:text-white"
              title="Close AutoPilot"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ---- Tour panel ---- */}
      {open && (
        <div className="fixed bottom-8 right-8 z-[70] w-[calc(100vw-3rem)] sm:w-[380px] animate-fade-in">
          <div className="glass-panel rounded-2xl border border-primary/40 shadow-[0_16px_48px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(159,122,234,0.15)] overflow-hidden bg-[#0f131d]/95 backdrop-blur-2xl">
            {/* Header */}
            <div className="px-5 py-3 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-on-primary font-bold rounded-full text-[10px] tracking-wider">TOUR</span>
                <span className="text-xs text-gray-400 font-mono-data">Step {step + 1} of {totalSteps}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStep(0)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                  title="Restart tour"
                >
                  <span className="material-symbols-outlined text-sm">replay</span>
                </button>
                <button
                  onClick={close}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                  title="Close tour"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 shadow-[0_0_8px_rgba(173,198,255,0.4)]"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              <h4 className="text-headline-sm font-headline-sm text-white m-0 font-bold">{current.title}</h4>
              <p className="text-body-sm text-gray-300 leading-relaxed m-0">{current.body}</p>

              {current.hint && (
                <>
                  <div className="h-[1px] bg-white/10 w-full my-1"></div>
                  <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 p-2.5 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5 flex-shrink-0">lightbulb</span>
                    <p className="text-xs text-primary/90 italic m-0 leading-normal">{current.hint}</p>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-white/5">
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  Back
                  <span className="px-1 py-0.5 bg-white/10 rounded text-[10px] ml-1 font-mono-data">←</span>
                </button>

                {step < totalSteps - 1 ? (
                  <button
                    onClick={next}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow-lg shadow-primary/20 active:scale-95"
                  >
                    Next
                    <span className="px-1 py-0.5 bg-white/20 rounded text-[10px] ml-1 font-mono-data">→</span>
                  </button>
                ) : (
                  <button
                    onClick={close}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Finish ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoPilot;

