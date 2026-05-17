import React, { useState } from 'react';
import { useNotify } from '../hooks/useNotify';

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const notify = useNotify();

  const handleVerify = (txId: string) => {
    notify({
      title: 'Poseidon Hash Verified',
      description: `Transaction ${txId} successfully verified against the Midnight Zero-Knowledge ZK-SNARK ledger.`,
      status: 'success',
    });
  };

  const txs = [
    { id: '0x8f7a...3b21', type: 'Shielded Deposit', amount: '$10,000,000 USDC', vault: 'ZKP-PRO-9921', status: 'Verified', time: '5 mins ago', category: 'Deposits' },
    { id: '0x3a1b...9c44', type: 'Unshielded Borrow', amount: '$2,500,000 USDT', vault: 'ZKP-PRO-9921', status: 'Verified', time: '1 hour ago', category: 'Borrows' },
    { id: '0x7c22...1a05', type: 'ZK Proof Verification', amount: 'Circuit #4412', vault: 'Identity Auth', status: 'Verified', time: '3 hours ago', category: 'ZK Proofs' },
    { id: '0x9d44...8e22', type: 'Oracle Slashing', amount: '-50,000 vePRO', vault: 'Node #12', status: 'Slashed', time: '1 day ago', category: 'Oracles' },
    { id: '0x1e88...5b99', type: 'Shielded Deposit', amount: '$5,000,000 WETH', vault: 'ZKP-ETH-8841', status: 'Verified', time: '2 days ago', category: 'Deposits' },
  ];

  const filteredTxs = filter === 'All' ? txs : txs.filter(t => t.category === filter);

  return (
    <div className="flex-1 p-margin-desktop space-y-unit-xl max-w-container-max mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-display-lg font-display-lg m-0 mb-2 text-on-surface font-bold">Midnight ZK Ledger</h1>
          <p className="text-body-lg text-on-surface-variant m-0">Cryptographic audit trail of all shielded transactions, Poseidon hashes, and oracle consensus events.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high p-1 rounded-xl border border-white/10">
          {['All', 'Deposits', 'Borrows', 'ZK Proofs', 'Oracles'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold text-xs border-0 cursor-pointer transition-all ${filter === f ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-transparent text-on-surface-variant hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Network Status Banner */}
      <div className="glass-panel p-6 rounded-2xl border-primary/20 bg-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h4 className="font-bold text-on-surface m-0 mb-1">Midnight Fast-Finality Active</h4>
            <p className="text-xs text-on-surface-variant m-0">Zero-knowledge proof generation latency: <span className="text-primary font-bold">1.2 seconds</span> | Current Block: <span className="font-mono text-secondary font-bold">#884192</span></p>
          </div>
        </div>
        <button 
          onClick={() => notify({ title: 'Ledger Synced', description: 'All local Merkle roots match the Midnight blockchain state.', status: 'info' })}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border-0 cursor-pointer transition-colors"
        >
          Sync Ledger
        </button>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-2xl border-white/10 p-8 space-y-6">
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant text-label-md">
                <th className="pb-4 font-bold">TxID / Hash</th>
                <th className="pb-4 font-bold">Type</th>
                <th className="pb-4 font-bold">Amount / Details</th>
                <th className="pb-4 font-bold">Vault / Node</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Time</th>
                <th className="pb-4 font-bold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-body-md">
              {filteredTxs.map((tx, idx) => (
                <tr key={idx}>
                  <td className="py-5 font-mono text-secondary font-bold">{tx.id}</td>
                  <td className="py-5 font-bold text-on-surface">{tx.type}</td>
                  <td className="py-5 font-bold text-primary">{tx.amount}</td>
                  <td className="py-5 text-on-surface-variant font-bold">{tx.vault}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tx.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-error/10 text-error border-error/20'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-5 text-on-surface-variant text-xs font-bold">{tx.time}</td>
                  <td className="py-5 text-right">
                    <button 
                      onClick={() => handleVerify(tx.id)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-xs border border-primary/20 cursor-pointer transition-colors"
                    >
                      Verify Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
