import React, { useEffect, useState } from 'react';
import { getOracleMembers } from '../api/crediproApi';

interface OracleMember {
  id: string;
  name: string;
  publicKey: string;
}

export const OracleMembers: React.FC = () => {
  const [members, setMembers] = useState<OracleMember[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOracleMembers = async () => {
      setLoading(true);
      try {
        const res = await getOracleMembers();
        if (!active) return;
        setMembers(res.members ?? []);
      } catch {
        // Silently fail — DefaultResolution shows an error if needed
        if (active) setMembers([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOracleMembers();
    return () => { active = false; };
  }, []);

  return (
    <div className="glass-panel p-unit-lg rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">group</span>
        <h3 className="text-headline-md font-headline-md text-on-surface">Oracle Committee Overview</h3>
      </div>
      {loading ? (
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-on-surface-variant">Loading oracle committee members...</p>
        </div>
      ) : members && members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-md">
          {members.map(m => (
            <div key={m.id} className="bg-surface-container-low border border-white/5 p-4 rounded-lg flex items-center justify-between gap-3 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">{m.name}</p>
                  <p className="text-xs text-on-surface-variant font-mono-data">{m.publicKey.slice(0, 8)}...{m.publicKey.slice(-6)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant py-2">No oracle committee members available.</p>
      )}
    </div>
  );
};

export default OracleMembers;
