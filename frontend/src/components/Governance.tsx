import React, { useState } from 'react';
import { useNotify } from '../hooks/useNotify';

const Governance: React.FC = () => {
  const notify = useNotify();
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const handleVote = (mip: string, choice: string) => {
    setVoted((prev) => ({ ...prev, [mip]: true }));
    notify({
      title: 'Vote Cast Successfully',
      description: `Your cryptographic vote for ${mip} (${choice}) has been recorded on the Midnight ledger.`,
      status: 'success',
    });
  };

  return (
    <div className="flex-1 p-margin-desktop space-y-unit-xl max-w-container-max mx-auto w-full">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-display-lg font-display-lg m-0 mb-2 text-on-surface font-bold">DAO Governance</h1>
          <p className="text-body-lg text-on-surface-variant m-0">Participate in protocol upgrades, oracle committee elections, and risk parameter adjustments.</p>
        </div>
        <button 
          onClick={() => notify({ title: 'vePRO Lock Extended', description: 'Your voting power multiplier is active for 4 years.', status: 'success' })}
          className="bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer"
        >
          Lock vePRO Tokens
        </button>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Your Voting Power</p>
          <p className="text-headline-lg font-headline-lg font-bold text-on-surface m-0">2,500,000 <span className="text-primary text-headline-md">vePRO</span></p>
          <p className="text-xs text-emerald-400 m-0 font-bold">4.0x Lock Multiplier Active</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Staked Oracle Nodes</p>
          <p className="text-headline-lg font-headline-lg font-bold text-tertiary m-0">32 <span className="text-on-surface text-headline-md">Active</span></p>
          <p className="text-xs text-on-surface-variant m-0">0 Slashed Nodes this epoch</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Quorum Threshold</p>
          <p className="text-headline-lg font-headline-lg font-bold text-emerald-400 m-0">10,000,000 <span className="text-on-surface text-headline-md">PRO</span></p>
          <p className="text-xs text-on-surface-variant m-0">67% Supermajority required</p>
        </div>
      </div>

      {/* Active MIPs */}
      <div className="space-y-6">
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0">Midnight Improvement Proposals (MIPs)</h2>
        
        {/* MIP 25 */}
        <div className="glass-panel p-8 rounded-2xl border-white/10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">Active</span>
                <span className="font-mono text-secondary font-bold">MIP-25</span>
              </div>
              <h3 className="text-headline-md font-headline-md font-bold text-on-surface m-0 mb-2">Adjust Base Borrow Rate to 4.2% for AA Tier</h3>
              <p className="text-body-md text-on-surface-variant m-0 max-w-3xl">Optimize capital efficiency by reducing the uncollateralized borrow rate for institutions maintaining an AA credit rating over 12 consecutive epochs.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant m-0 mb-1 font-bold">Voting Ends in</p>
              <p className="text-headline-md font-headline-md font-bold text-emerald-400 m-0">2 days 14 hours</p>
            </div>
          </div>

          <div className="space-y-3 bg-surface-container-highest/40 p-6 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-bold text-on-surface">
              <span>Yes: 8,420,000 vePRO (84.2%)</span>
              <span>No: 1,580,000 vePRO (15.8%)</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 h-full w-[84.2%]"></div>
              <div className="bg-error h-full w-[15.8%]"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {voted['MIP-25'] ? (
              <p className="text-emerald-400 font-bold m-0 flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span> Your vote has been recorded.
              </p>
            ) : (
              <>
                <button onClick={() => handleVote('MIP-25', 'Yes')} className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-xl border border-emerald-500/30 cursor-pointer transition-colors">Vote YES</button>
                <button onClick={() => handleVote('MIP-25', 'No')} className="px-6 py-3 bg-error/20 hover:bg-error/30 text-error font-bold rounded-xl border border-error/30 cursor-pointer transition-colors">Vote NO</button>
              </>
            )}
          </div>
        </div>

        {/* MIP 24 */}
        <div className="glass-panel p-8 rounded-2xl border-white/10 space-y-6 opacity-80">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">Passed</span>
                <span className="font-mono text-secondary font-bold">MIP-24</span>
              </div>
              <h3 className="text-headline-md font-headline-md font-bold text-on-surface m-0 mb-2">Onboard GS Institutional Liquidity Pool</h3>
              <p className="text-body-md text-on-surface-variant m-0 max-w-3xl">Establish a new $50M shielded lending pool for Goldman Sachs with customized zero-knowledge solvency circuit verification.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant m-0 mb-1 font-bold">Status</p>
              <p className="text-headline-md font-headline-md font-bold text-primary m-0">Queued for Execution</p>
            </div>
          </div>

          <div className="space-y-3 bg-surface-container-highest/40 p-6 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-bold text-on-surface">
              <span>Yes: 14,200,000 vePRO (94.6%)</span>
              <span>No: 810,000 vePRO (5.4%)</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 h-full w-[94.6%]"></div>
              <div className="bg-error h-full w-[5.4%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
