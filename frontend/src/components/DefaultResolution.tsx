import React, { useState, useEffect, useCallback } from 'react';
import {
  oracleVote,
  getOracleMembers,
  triggerSlashing,
  getOracleApprovals,
  OracleMember,
  OracleVoteResponse,
} from '../api/crediproApi';
import { useNotify } from '../hooks/useNotify';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoteState {
  consensusReached: boolean;
  approvalCount: number;
  threshold: number;
  totalMembers: number;
}

interface SlashDisplayState {
  status: 'success' | 'failure';
  message: string;
}

// ---------------------------------------------------------------------------
// Oracle flow steps (for the step indicator)
// ---------------------------------------------------------------------------
const ORACLE_STEPS = [
  { id: 'load-id',   label: 'Enter Loan ID',          description: 'Paste a valid 0x… loan ID (66 chars)' },
  { id: 'cast-vote', label: 'Cast Oracle Votes',       description: 'Each oracle member votes to approve' },
  { id: 'consensus', label: 'Consensus Reached',       description: `≥ ⅔ of members must approve` },
  { id: 'slash',     label: 'Execute Slashing',        description: 'Trigger on-chain penalty for default' },
];

function getActiveStep(loanId: string, vote?: VoteState): number {
  if (!loanId || (!loanId.startsWith('0x') || loanId.length !== 66)) return 0;
  if (!vote || vote.approvalCount === 0) return 1;
  if (!vote.consensusReached) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DefaultResolution: React.FC = () => {
  const notify = useNotify();

  // --- Loan ID ---
  const [loanId, setLoanId] = useState('');

  // --- Oracle members ---
  const [members, setMembers] = useState<OracleMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // --- Per-member vote tracking (client side, using member.id) ---
  const [votedMembers, setVotedMembers] = useState<Set<string>>(new Set());

  // --- Aggregate vote state keyed by loanId ---
  const [voteResults, setVoteResults] = useState<Record<string, VoteState>>({});

  // --- Per-member loading indicator (using member.id) ---
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

  // --- Manual Sync ---
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Slashing ---
  const [slashingLoading, setSlashingLoading] = useState(false);
  const [slashingResult, setSlashingResult] = useState<SlashDisplayState | null>(null);

  // -----------------------------------------------------------------------
  // Fetch consensus
  // -----------------------------------------------------------------------

  const fetchConsensusProgress = useCallback(async (id: string, showToast = false) => {
    if (!id.startsWith('0x') || id.length !== 66) return;

    try {
      if (showToast) setIsSyncing(true);
      const response = await getOracleApprovals(id);

      setVoteResults((prev) => ({
        ...prev,
        [id]: {
          consensusReached: response.approvalCount >= response.threshold,
          approvalCount: response.approvalCount,
          threshold: response.threshold,
          totalMembers: response.totalMembers,
        },
      }));

      if (showToast) {
        notify({
          title: 'Status Refreshed',
          description: `Approvals: ${response.approvalCount}/${response.threshold}`,
          status: 'info',
        });
      }
    } catch (error) {
      if (showToast) {
        notify({
          title: 'Error refreshing status',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      }
    } finally {
      if (showToast) setIsSyncing(false);
    }
  }, [notify]);

  // -----------------------------------------------------------------------
  // Load members on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const response = await getOracleMembers();
        if (!cancelled && response && Array.isArray(response.members)) {
          setMembers(response.members);
        } else if (!cancelled) {
          setMembers([]);
        }
      } catch (error) {
        if (!cancelled) {
          setMembers([]);
          // Silently fail in demo mode when backend is offline
        }
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };

    fetchMembers();
    return () => { cancelled = true; };
  }, [notify]);

  // Re-fetch consensus when loan ID changes
  useEffect(() => {
    const trimmedId = loanId.trim();
    if (trimmedId.startsWith('0x') && trimmedId.length === 66) {
      fetchConsensusProgress(trimmedId, false);
    }
    // Reset transient client state on ID change
    setVotedMembers(new Set());
    setSlashingResult(null);
  }, [loanId, fetchConsensusProgress]);

  // -----------------------------------------------------------------------
  // Vote handler
  // -----------------------------------------------------------------------

  const handleVote = useCallback(
    async (memberId: string) => {
      const trimmedId = loanId.trim();
      if (!trimmedId) {
        notify({ title: 'Loan ID required', description: 'Please enter a Loan ID before voting.', status: 'warning' });
        return;
      }

      setVotingInProgress(memberId);
      try {
        const response: OracleVoteResponse = await oracleVote(trimmedId, memberId);

        if (response.success) {
          setVotedMembers((prev) => new Set(prev).add(memberId));

          setVoteResults((prev) => ({
            ...prev,
            [trimmedId]: {
              consensusReached: response.consensusReached,
              approvalCount: response.approvalCount,
              threshold: response.threshold,
              totalMembers: response.totalMembers,
            },
          }));

          setSlashingResult(null);

          notify({
            title: `✅ Vote cast`,
            description: `${response.approvalCount}/${response.totalMembers} approvals recorded`,
            status: 'success',
          });
        } else {
          notify({ title: 'Vote failed', description: 'Could not cast vote', status: 'error' });
        }
      } catch (error) {
        notify({
          title: 'Error casting vote',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      } finally {
        setVotingInProgress(null);
      }
    },
    [loanId, notify],
  );

  // -----------------------------------------------------------------------
  // Slashing handler
  // -----------------------------------------------------------------------

  const handleTriggerSlashing = useCallback(async () => {
    const trimmedId = loanId.trim();
    if (!trimmedId) return;

    setSlashingLoading(true);
    try {
      const response = await triggerSlashing(trimmedId);
      if (response.success) {
        setSlashingResult({
          status: 'success',
          message: `Loan ${trimmedId.slice(0, 10)}… marked as defaulted. Slashing executed successfully.`,
        });
        notify({
          title: '⚡ Slashing Triggered',
          description: 'Loan has been marked as defaulted on-chain.',
          status: 'success',
          duration: 9000,
        });
      } else {
        setSlashingResult({
          status: 'failure',
          message: response.error || 'Unknown error occurred while triggering slashing.',
        });
        notify({
          title: 'Slashing failed',
          description: response.error || 'Could not trigger slashing',
          status: 'error',
          duration: 9000,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setSlashingResult({ status: 'failure', message: msg });
      notify({ title: 'Error', description: msg, status: 'error', duration: 9000 });
    } finally {
      setSlashingLoading(false);
    }
  }, [loanId, notify]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const trimmedLoanId = loanId.trim();
  const currentVote = trimmedLoanId ? voteResults[trimmedLoanId] : undefined;

  const approvalCount  = currentVote?.approvalCount ?? 0;
  const threshold      = currentVote?.threshold ?? Math.ceil(members.length * (2 / 3));
  const totalMembers   = currentVote?.totalMembers ?? members.length;
  const consensusReached = currentVote?.consensusReached ?? false;

  const progressPercent = threshold > 0 ? Math.min((approvalCount / threshold) * 100, 100) : 0;
  const canVote         = trimmedLoanId.length > 0;
  const remainingVotes  = Math.max(0, threshold - approvalCount);
  const activeStep      = getActiveStep(trimmedLoanId, currentVote);

  const isValidLoanId = trimmedLoanId.startsWith('0x') && trimmedLoanId.length === 66;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <section className="glass-panel p-unit-lg rounded-xl">
      <div className="space-y-6">

        {/* -------- Title + Refresh -------- */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">gavel</span>
            <h3 className="text-headline-md font-headline-md text-on-surface">Oracle Voting & Slashing Panel</h3>
          </div>
          {isValidLoanId && (
            <button
              onClick={() => fetchConsensusProgress(trimmedLoanId, true)}
              disabled={isSyncing}
              className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container-highest/80 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 border border-white/10"
            >
              <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>refresh</span>
              <span>Refresh Status</span>
            </button>
          )}
        </div>

        <hr className="border-white/10" />

        {/* -------- Step-flow indicator -------- */}
        <div className="p-4 rounded-lg bg-surface-container/30 border border-white/5">
          <p className="text-xs text-on-surface-variant font-bold mb-4 uppercase tracking-wider">Voting Flow</p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            {/* Background Connectors */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 hidden md:block"></div>

            {ORACLE_STEPS.map((step, idx) => {
              const isDone    = idx < activeStep;
              const isActive  = idx === activeStep;
              const isPending = idx > activeStep;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex flex-col items-center gap-2 group relative flex-1 ${isPending ? 'opacity-40' : ''} transition-all duration-300`}>
                    <div className={`w-10 h-10 rounded-full bg-surface-container-highest border-2 ${isDone ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : isActive ? 'border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(173,198,255,0.4)]' : 'border-white/20 text-white/40'} flex items-center justify-center relative transition-all`}>
                      {isActive && <div className="absolute inset-0 rounded-full zk-shimmer opacity-30 animate-pulse"></div>}
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm">done</span>
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-on-surface mb-0.5">{step.label}</p>
                      <p className="text-[10px] text-on-surface-variant max-w-[120px]">{step.description}</p>
                    </div>
                  </div>
                  {idx < ORACLE_STEPS.length - 1 && (
                    <span className="material-symbols-outlined text-white/20 hidden md:block text-sm">arrow_forward</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* -------- Loan ID Input -------- */}
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Loan ID</label>
          <input
            id="oracle-loan-id"
            type="text"
            className={`w-full bg-surface-container-lowest border ${trimmedLoanId.length > 0 && !isValidLoanId ? 'border-error focus:ring-error' : 'border-white/10 focus:ring-primary'} rounded-lg py-3 px-4 text-on-surface font-mono-data focus:ring-2 outline-none transition-all`}
            placeholder="Enter valid 66-character Loan ID (0x…)"
            value={loanId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanId(e.target.value)}
          />
          <p className={`text-xs mt-1.5 ${trimmedLoanId.length > 0 && !isValidLoanId ? 'text-error font-medium' : 'text-on-surface-variant font-mono-data'}`}>
            {trimmedLoanId.length > 0 && !isValidLoanId
              ? `Invalid — must be 0x followed by 64 hex characters (currently ${trimmedLoanId.length} chars)`
              : 'Format: 0x followed by 64 hex characters'}
          </p>
        </div>

        <hr className="border-white/10" />

        {/* -------- Oracle Members -------- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-body-lg font-bold text-on-surface">Oracle Committee Members</h4>
            {membersLoading && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-on-surface-variant">Loading…</span>
              </div>
            )}
          </div>

          {membersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-warning">warning</span>
              <p className="text-sm">No oracle members available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {members.map((member) => {
                const hasVoted  = votedMembers.has(member.id);
                const isLoading = votingInProgress === member.id;
                const disabled  = hasVoted || !canVote || !isValidLoanId;

                return (
                  <div
                    key={member.id}
                    className={`p-5 rounded-lg bg-surface-container/30 border ${hasVoted ? 'border-emerald-500/50 bg-emerald-500/5' : isLoading ? 'border-primary shadow-[0_0_15px_rgba(173,198,255,0.3)]' : 'border-white/5'} transition-all duration-300 flex flex-col justify-between`}
                  >
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-on-surface text-base mb-0.5">{member.name}</h5>
                          <p className="text-xs text-on-surface-variant font-mono-data truncate max-w-[150px]">
                            {member.publicKey.slice(0, 16)}…
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${hasVoted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : isLoading ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {hasVoted ? (
                            <>
                              <span className="material-symbols-outlined text-xs">done</span>
                              <span>Voted</span>
                            </>
                          ) : isLoading ? (
                            <>
                              <div className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span>Voting…</span>
                            </>
                          ) : (
                            <span>Pending</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVote(member.id)}
                      disabled={disabled}
                      className={`w-full py-3 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${hasVoted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/20'} disabled:opacity-50`}
                    >
                      {hasVoted ? (
                        <>
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Vote Recorded</span>
                        </>
                      ) : isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>Voting…</span>
                        </>
                      ) : (
                        <>
                          {disabled && !hasVoted && !isLoading && <span className="material-symbols-outlined text-xs">lock</span>}
                          <span>Vote as {member.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-white/10" />

        {/* -------- Consensus Progress -------- */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Consensus Progress</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${consensusReached ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : approvalCount > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {consensusReached
                ? '✓ Consensus Reached'
                : approvalCount > 0
                ? `${remainingVotes} more vote${remainingVotes !== 1 ? 's' : ''} needed`
                : 'Awaiting votes'}
            </span>
          </div>

          <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden border border-white/5 mb-3">
            <div
              className={`h-full transition-all duration-500 ${consensusReached ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-primary to-secondary'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-on-surface-variant font-mono-data">
            <span>{approvalCount} / {threshold} approvals needed</span>
            <span>{totalMembers} member{totalMembers !== 1 ? 's' : ''} total</span>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* -------- Slashing Action -------- */}
        <div>
          {consensusReached ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                <p className="text-sm text-emerald-200 font-medium">
                  Consensus threshold met — you may now trigger on-chain slashing.
                </p>
              </div>

              <button
                id="oracle-trigger-slash"
                type="button"
                onClick={handleTriggerSlashing}
                disabled={slashingLoading}
                className="w-full py-4 bg-error text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-error/20"
              >
                {slashingLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing Slashing…</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">warning</span>
                    <span>Trigger Slashing</span>
                  </>
                )}
              </button>

              {slashingResult && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${slashingResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-error/10 border-error/30 text-error'}`}>
                  <span className="material-symbols-outlined text-xl">{slashingResult.status === 'success' ? 'check_circle' : 'warning'}</span>
                  <p className="text-sm font-medium">{slashingResult.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-surface-container/30 border border-dashed border-white/15 flex items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-xl">info</span>
              <p className="text-sm font-medium">
                {!isValidLoanId
                  ? 'Enter a valid Loan ID above to begin the voting process'
                  : canVote && approvalCount === 0
                  ? 'Cast at least one oracle vote to start building consensus'
                  : 'Awaiting oracle votes to reach consensus threshold…'}
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default DefaultResolution;
