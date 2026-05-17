import React from 'react';
import { useNotify } from '../hooks/useNotify';

const Portfolio: React.FC = () => {
  const notify = useNotify();

  const handleAction = (action: string, asset: string) => {
    notify({
      title: `${action} Initiated`,
      description: `Zero-Knowledge proof generation for ${asset} ${action.toLowerCase()} is in progress on Midnight.`,
      status: 'success',
    });
  };

  return (
    <div className="flex-1 p-margin-desktop space-y-unit-xl max-w-container-max mx-auto w-full">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-display-lg font-display-lg m-0 mb-2 text-on-surface font-bold">Institutional Portfolio</h1>
          <p className="text-body-lg text-on-surface-variant m-0">Manage your shielded liquidity positions, collateral vaults, and accrued yield.</p>
        </div>
        <button 
          onClick={() => handleAction('Yield Harvest', 'All Pools')}
          className="bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer"
        >
          Harvest All Yield
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Total Supplied</p>
          <p className="text-headline-lg font-headline-lg font-bold text-on-surface m-0">$45,250,000</p>
          <p className="text-xs text-emerald-400 m-0 flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-xs">trending_up</span> +12.4% this month
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Total Borrowed</p>
          <p className="text-headline-lg font-headline-lg font-bold text-primary m-0">$12,400,000</p>
          <p className="text-xs text-on-surface-variant m-0">Shielded institutional debt</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Net APY</p>
          <p className="text-headline-lg font-headline-lg font-bold text-emerald-400 m-0">+14.25%</p>
          <p className="text-xs text-on-surface-variant m-0">Compounded continuously</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-2">
          <p className="text-label-md text-on-surface-variant m-0 uppercase tracking-wider">Health Factor</p>
          <p className="text-headline-lg font-headline-lg font-bold text-tertiary m-0">3.85</p>
          <p className="text-xs text-emerald-400 m-0 font-bold">Ultra Safe (AA Tier)</p>
        </div>
      </div>

      {/* Active Vault Positions */}
      <div className="glass-panel rounded-2xl border-white/10 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0">Active Vault Positions</h2>
          <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
            3 Shielded Vaults
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant text-label-md">
                <th className="pb-4 font-bold">Pool ID</th>
                <th className="pb-4 font-bold">Asset</th>
                <th className="pb-4 font-bold">Supplied</th>
                <th className="pb-4 font-bold">Current APY</th>
                <th className="pb-4 font-bold">Collateral Status</th>
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-body-md">
              <tr>
                <td className="py-5 font-mono text-secondary font-bold">ZKP-PRO-9921</td>
                <td className="py-5 flex items-center gap-2 font-bold text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> USDC Institutional
                </td>
                <td className="py-5 font-bold">$25,000,000</td>
                <td className="py-5 text-emerald-400 font-bold">12.45%</td>
                <td className="py-5"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">Enabled</span></td>
                <td className="py-5 text-right space-x-2">
                  <button onClick={() => handleAction('Deposit', 'USDC')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border-0 cursor-pointer transition-colors">Deposit</button>
                  <button onClick={() => handleAction('Withdraw', 'USDC')} className="px-4 py-2 bg-transparent hover:bg-white/5 text-error rounded-lg font-bold text-xs border border-error/30 cursor-pointer transition-colors">Withdraw</button>
                </td>
              </tr>
              <tr>
                <td className="py-5 font-mono text-secondary font-bold">ZKP-ETH-8841</td>
                <td className="py-5 flex items-center gap-2 font-bold text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> WETH Shielded
                </td>
                <td className="py-5 font-bold">$15,250,000</td>
                <td className="py-5 text-emerald-400 font-bold">8.12%</td>
                <td className="py-5"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">Enabled</span></td>
                <td className="py-5 text-right space-x-2">
                  <button onClick={() => handleAction('Deposit', 'WETH')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border-0 cursor-pointer transition-colors">Deposit</button>
                  <button onClick={() => handleAction('Withdraw', 'WETH')} className="px-4 py-2 bg-transparent hover:bg-white/5 text-error rounded-lg font-bold text-xs border border-error/30 cursor-pointer transition-colors">Withdraw</button>
                </td>
              </tr>
              <tr>
                <td className="py-5 font-mono text-secondary font-bold">ZKP-WBTC-3312</td>
                <td className="py-5 flex items-center gap-2 font-bold text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> WBTC Premium
                </td>
                <td className="py-5 font-bold">$5,000,000</td>
                <td className="py-5 text-emerald-400 font-bold">6.50%</td>
                <td className="py-5"><span className="px-3 py-1 bg-white/5 text-on-surface-variant rounded-full text-xs font-bold border border-white/10">Disabled</span></td>
                <td className="py-5 text-right space-x-2">
                  <button onClick={() => handleAction('Deposit', 'WBTC')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border-0 cursor-pointer transition-colors">Deposit</button>
                  <button onClick={() => handleAction('Withdraw', 'WBTC')} className="px-4 py-2 bg-transparent hover:bg-white/5 text-error rounded-lg font-bold text-xs border border-error/30 cursor-pointer transition-colors">Withdraw</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
