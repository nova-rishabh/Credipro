import React, { useState } from 'react';
import { getLoanDetails, LoanDetails as LoanDetailsType } from '../api/crediproApi';

const LoanDetails: React.FC = () => {
  const [loanId, setLoanId] = useState('');
  const [loanDetails, setLoanDetails] = useState<LoanDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!loanId.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoanDetails(null);

    try {
      const data = await getLoanDetails(loanId.trim());
      if (data) {
        setLoanDetails(data);
      } else {
        setError('Loan not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loan details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format a numeric string as a locale-aware decimal string.
   * Example: "1000000" -> "1,000,000.00"
   */
  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  /**
   * Truncate a long string for display, showing only the first and last N chars.
   * Example: "0xabc123...def456" (for 8-char padding)
   */
  const truncate = (str: string, chars: number = 8): string => {
    if (str.length <= chars * 2) return str;
    return `${str.slice(0, chars)}...${str.slice(-chars)}`;
  };

  return (
    <section className="glass-panel p-unit-lg rounded-xl">
      <div className="flex items-center gap-2 mb-unit-lg">
        <span className="material-symbols-outlined text-primary">search</span>
        <h3 className="text-headline-md font-headline-md text-on-surface">Loan Details Lookup</h3>
      </div>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
        <div className="flex-1 w-full">
          <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Loan ID</label>
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
            value={loanId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanId(e.target.value)}
            placeholder="Enter loan ID"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleLookup();
            }}
          />
        </div>
        <button
          onClick={handleLookup}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-tertiary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-tertiary/20 h-[50px]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Searching…</span>
            </>
          ) : (
            <span>Look Up</span>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-8 h-8 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-on-surface-variant">Fetching loan details…</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20 mb-6">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      {/* Loan Details Display */}
      {loanDetails && !isLoading && (
        <>
          <hr className="border-white/10 my-6" />
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Loan ID</span>
              <code className="text-xs font-mono-data text-primary bg-surface-container-lowest px-2 py-1 rounded border border-white/5">{truncate(loanDetails.loanId)}</code>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Amount</span>
              <span className="text-body-lg font-bold text-on-surface font-mono-data">{formatAmount(loanDetails.disbursedAmount)} <span className="text-primary text-sm">ADA</span></span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${loanDetails.isDefaulted ? 'bg-error/20 text-error border border-error/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {loanDetails.isDefaulted ? 'Defaulted' : 'Active'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Interest Rate</span>
              <span className="text-body-md text-on-surface font-mono-data">{loanDetails.interestRate}%</span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Lender Address</span>
              <code className="text-xs font-mono-data text-tertiary bg-surface-container-lowest px-2 py-1 rounded border border-white/5">{truncate(loanDetails.lenderAddress)}</code>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Identity Hash</span>
              <code className="text-xs font-mono-data text-secondary bg-surface-container-lowest px-2 py-1 rounded border border-white/5">{truncate(loanDetails.identityHash)}</code>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Borrower Key</span>
              <code className="text-xs font-mono-data text-primary bg-surface-container-lowest px-2 py-1 rounded border border-white/5">{truncate(loanDetails.borrowerPublicKey)}</code>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Default Threshold</span>
              <span className="text-body-md text-on-surface font-mono-data">{loanDetails.defaultThreshold}</span>
            </div>

            <div className="flex justify-between items-center bg-surface-container/30 p-3 rounded-lg border border-white/5">
              <span className="text-label-md font-label-md text-on-surface-variant">Disbursed</span>
              <span className="text-body-md text-on-surface font-mono-data">
                {new Date(loanDetails.disbursalTimestamp * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default LoanDetails;
