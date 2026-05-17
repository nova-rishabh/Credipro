import React, { useState, useEffect, useMemo } from 'react';
import { useCredipro } from '../context/CrediproContext';
import { requestLoan, getPoolDetails, PoolDetails } from '../api/crediproApi';
import { useNotify } from '../hooks/useNotify';

// ---------------------------------------------------------------------------
// Step definitions for the ZK + ledger flow
// ---------------------------------------------------------------------------
const LOAN_STEPS = [
  { id: 'witness',   label: 'Generating ZK witness locally…',       durationMs: 1400, icon: 'done' },
  { id: 'proof',     label: 'Verifying credit eligibility circuit…', durationMs: 2000, icon: 'cyclone' },
  { id: 'broadcast', label: 'Broadcasting to Midnight ledger…',      durationMs: 1500, icon: 'hub' },
  { id: 'settle',    label: 'Settling state & updating indexer…',    durationMs: 1200, icon: 'check_circle' },
];

// Preset loan scenarios shown in the dropdown
const PRESETS = [
  { label: '— choose a preset —', amount: 0, term: 0 },
  { label: '🌱 Micro Loan — 500 ADA / 90 days',    amount: 500,   term: 90  },
  { label: '📦 Standard — 5,000 ADA / 180 days',   amount: 5000,  term: 180 },
  { label: '🏗  Business — 25,000 ADA / 365 days',  amount: 25000, term: 365 },
  { label: '🏦 Enterprise — 100,000 ADA / 730 days', amount: 100000, term: 730 },
];

export const LoanDashboard: React.FC = () => {
  const { isConnected, contractAddress } = useCredipro();
  const notify = useNotify();

  // --- Form state ---
  const [preset, setPreset] = useState(0);
  const [loanAmount, setLoanAmount] = useState<number>(5000);
  const [termDays, setTermDays]     = useState<number>(180);

  // --- Validation ---
  const [amountError, setAmountError] = useState<string>('');
  const [termError,   setTermError]   = useState<string>('');

  // --- Processing ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep,  setCurrentStep]  = useState<number>(-1); // -1 = idle

  // --- Pool ---
  const [poolParams,    setPoolParams]    = useState<PoolDetails | null>(null);
  const [isFetchingPool, setIsFetchingPool] = useState(false);

  const poolAddress = useMemo(
    () => contractAddress ?? ('0x' + 'f'.repeat(64)),
    [contractAddress]
  );

  // Fetch pool params once connected
  useEffect(() => {
    if (!isConnected) return;
    let active = true;
    const fetchPool = async () => {
      setIsFetchingPool(true);
      try {
        const details = await getPoolDetails(poolAddress);
        if (active && details) setPoolParams(details);
      } catch {
        // non-fatal — show nothing
      } finally {
        if (active) setIsFetchingPool(false);
      }
    };
    fetchPool();
    return () => { active = false; };
  }, [isConnected, poolAddress]);

  // Apply a preset when dropdown changes
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setPreset(idx);
    if (idx > 0) {
      setLoanAmount(PRESETS[idx].amount);
      setTermDays(PRESETS[idx].term);
      setAmountError('');
      setTermError('');
    }
  };

  // Inline validation
  const validate = (): boolean => {
    let ok = true;
    if (!loanAmount || loanAmount < 100) {
      setAmountError('Minimum loan amount is 100 ADA.');
      ok = false;
    } else if (poolParams && loanAmount > Number(poolParams.riskParams.maxLoanAmount)) {
      setAmountError(`Exceeds pool maximum of ${formatAmount(poolParams.riskParams.maxLoanAmount)} ADA.`);
      ok = false;
    } else {
      setAmountError('');
    }

    if (!termDays || termDays < 7) {
      setTermError('Minimum loan term is 7 days.');
      ok = false;
    } else if (termDays > 1825) {
      setTermError('Maximum loan term is 1,825 days (5 years).');
      ok = false;
    } else {
      setTermError('');
    }
    return ok;
  };

  // Multi-step loan submission
  const handleRequestLoan = async () => {
    if (!validate()) return;

    setIsProcessing(true);
    setCurrentStep(0);

    try {
      for (let i = 0; i < LOAN_STEPS.length; i++) {
        setCurrentStep(i);
        if (i < LOAN_STEPS.length - 1) {
          await new Promise(r => setTimeout(r, LOAN_STEPS[i].durationMs));
        } else {
          await new Promise(r => setTimeout(r, 600));
          const response = await requestLoan(loanAmount, poolAddress, termDays);
          if (response.success) {
            notify({
              title: '✅ Loan Requested!',
              description: `Loan ID: ${response.loanId?.substring(0, 14)}…`,
              status: 'success',
              duration: 8000,
            });
          } else {
            throw new Error(response.error || 'Failed to request loan');
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      notify({ title: 'Loan Request Failed', description: message, status: 'error' });
    } finally {
      setIsProcessing(false);
      setCurrentStep(-1);
    }
  };

  const formatAmount = (amount: string | number): string =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(amount));

  if (!isConnected) {
    return (
      <div className="col-span-12 glass-panel p-8 rounded-xl text-center border border-white/10 shadow-2xl">
        <p className="text-body-lg text-gray-200">Please connect your Lace wallet to request a loan.</p>
      </div>
    );
  }

  const progressPct =
    currentStep >= 0 ? Math.round(((currentStep + 1) / LOAN_STEPS.length) * 100) : 0;

  return (
    <>
      {/* Widget 1: Liquidity Pool Overview */}
      <section className="col-span-12 lg:col-span-7 glass-panel p-unit-lg rounded-xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-unit-lg">
            <div>
              <h3 className="text-headline-md font-headline-md text-on-surface">Liquidity Pool Overview</h3>
              <p className="text-body-md text-on-surface-variant">Alpha Institutional Pool #1</p>
            </div>
            <div className="text-right flex items-center gap-3">
              {isFetchingPool && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
              <div>
                <span className="text-headline-lg font-headline-lg text-primary">8.5%</span>
                <p className="text-label-md font-label-md text-on-surface-variant">Est. APY</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Utilization</span>
              <span className="text-label-md font-label-md text-on-surface">62% Full</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-tertiary shadow-[0_0_15px_rgba(173,198,255,0.4)]" style={{ width: '62%' }}></div>
            </div>
          </div>

          {poolParams ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-md">
              <div className="bg-surface-container/50 border border-white/5 p-4 rounded-lg">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Total Value Locked (TVL)</p>
                <p className="text-headline-md font-headline-md text-on-surface font-mono-data">{formatAmount(poolParams.tvl)} <span className="text-primary text-sm">ADA</span></p>
              </div>
              <div className="bg-surface-container/50 border border-white/5 p-4 rounded-lg">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Max Loan Amount</p>
                <p className="text-headline-md font-headline-md text-on-surface font-mono-data">{formatAmount(poolParams.riskParams.maxLoanAmount)} <span className="text-tertiary text-sm">ADA</span></p>
              </div>
              <div className="bg-surface-container/50 border border-white/5 p-4 rounded-lg">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Min Credit Score</p>
                <p className="text-headline-md font-headline-md text-on-surface font-mono-data">{poolParams.riskParams.minCreditScore}</p>
              </div>
              <div className="bg-surface-container/50 border border-white/5 p-4 rounded-lg">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Max LTV</p>
                <p className="text-headline-md font-headline-md text-on-surface font-mono-data">{poolParams.riskParams.maxLTV}%</p>
              </div>
              <div className="bg-surface-container/50 border border-white/5 p-4 rounded-lg md:col-span-2 flex items-center justify-between">
                <p className="text-label-md font-label-md text-on-surface-variant mb-0">Pool Contract Address</p>
                <code className="text-xs font-mono-data text-primary bg-surface-container-lowest px-2 py-1 rounded border border-white/5">{poolAddress.slice(0, 12)}…{poolAddress.slice(-10)}</code>
              </div>
            </div>
          ) : !isFetchingPool ? (
            <p className="text-body-md text-on-surface-variant py-4">Pool parameters unavailable — backend may be offline.</p>
          ) : null}
        </div>
      </section>

      {/* Widget 2: Loan Request Engine */}
      <section className="col-span-12 lg:col-span-5 glass-panel p-unit-lg rounded-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-unit-lg">
            <span className="material-symbols-outlined text-primary">speed</span>
            <h3 className="text-headline-md font-headline-md text-on-surface">Loan Request Engine</h3>
          </div>

          <form className="space-y-5 flex-1" onSubmit={(e) => { e.preventDefault(); handleRequestLoan(); }}>
            {/* Quick Presets */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Quick Presets</label>
              <select
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                value={preset}
                onChange={handlePresetChange}
                disabled={isProcessing}
              >
                {PRESETS.map((p, i) => (
                  <option key={i} value={i} className="bg-surface-container">
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-1.5">Select a preset to auto-fill the form, or enter custom values below.</p>
            </div>

            <hr className="border-white/10" />

            {/* Loan Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-label-md font-label-md text-on-surface-variant">Loan Amount (ADA)</label>
                {poolParams && (
                  <span className="text-xs text-on-surface-variant font-mono-data">max {formatAmount(poolParams.riskParams.maxLoanAmount)} ADA</span>
                )}
              </div>
              <input
                type="number"
                className={`w-full bg-surface-container-lowest border ${amountError ? 'border-error focus:ring-error' : 'border-white/10 focus:ring-primary'} rounded-lg py-3 px-4 text-on-surface focus:ring-2 outline-none transition-all`}
                value={loanAmount}
                onChange={(e) => { setLoanAmount(Number(e.target.value)); setPreset(0); }}
                min={100}
                max={poolParams ? Number(poolParams.riskParams.maxLoanAmount) : 1000000}
                disabled={isProcessing}
              />
              {amountError ? (
                <p className="text-xs text-error mt-1.5">{amountError}</p>
              ) : (
                <p className="text-xs text-on-surface-variant mt-1.5 font-mono-data">Minimum 100 ADA</p>
              )}
            </div>

            {/* Loan Term & Proof Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Term (Days)</label>
                <input
                  type="number"
                  className={`w-full bg-surface-container-lowest border ${termError ? 'border-error focus:ring-error' : 'border-white/10 focus:ring-primary'} rounded-lg py-3 px-4 text-on-surface focus:ring-2 outline-none transition-all`}
                  value={termDays}
                  onChange={(e) => { setTermDays(Number(e.target.value)); setPreset(0); }}
                  min={7}
                  max={1825}
                  disabled={isProcessing}
                />
                {termError ? (
                  <p className="text-xs text-error mt-1.5">{termError}</p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-1.5 font-mono-data">7 – 1,825 days</p>
                )}
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Proof Method</label>
                <div className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-3 px-4 text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">lock</span>
                  <span className="text-xs font-mono-data">ZK-Proof ID</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                id="loan-request-submit"
                type="button"
                onClick={handleRequestLoan}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>{currentStep >= 0 ? LOAN_STEPS[currentStep]?.label.replace('…', '') : 'Processing…'}</span>
                  </>
                ) : (
                  <span>Initialize Credit Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ZK Pipeline (Step-based Flow) */}
      <section className="col-span-12 glass-panel p-unit-lg rounded-xl overflow-hidden relative mt-2">
        <div className="flex items-center gap-2 mb-unit-lg">
          <span className="material-symbols-outlined text-secondary">auto_awesome</span>
          <h3 className="text-headline-md font-headline-md text-on-surface">ZK Pipeline Generation</h3>
        </div>

        {/* Progress bar when processing */}
        {isProcessing && (
          <div className="mb-8 w-full bg-surface-container-highest rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-gutter relative py-4">
          {/* Background Connectors */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 hidden md:block"></div>

          {LOAN_STEPS.map((step, idx) => {
            const done    = idx < currentStep;
            const active  = idx === currentStep;
            const pending = idx > currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-center gap-3 group relative flex-1 ${pending ? 'opacity-40' : ''} transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-full bg-surface-container-highest border-2 ${done ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : active ? 'border-secondary text-secondary bg-secondary/10 shadow-[0_0_15px_rgba(196,171,255,0.4)]' : 'border-white/20 text-white/40'} flex items-center justify-center relative transition-all`}>
                    {active && <div className="absolute inset-0 rounded-full zk-shimmer opacity-30 animate-pulse"></div>}
                    <span className={`material-symbols-outlined ${active ? 'animate-spin' : ''}`}>{done ? 'done' : active ? 'cyclone' : step.icon}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-label-md font-label-md text-on-surface mb-1">{idx + 1}. {step.label.replace('…', '')}</p>
                    <p className={`text-xs font-mono-data ${done ? 'text-emerald-400' : active ? 'text-secondary animate-pulse' : 'text-on-surface-variant'}`}>
                      {done ? 'COMPLETED' : active ? 'PROCESSING...' : 'PENDING'}
                    </p>
                  </div>
                </div>
                {idx < LOAN_STEPS.length - 1 && (
                  <span className="material-symbols-outlined text-white/20 hidden md:block">arrow_forward</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>
    </>
  );
};
