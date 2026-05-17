import React, { useState } from 'react';
import { useNotify } from '../hooks/useNotify';

const Settings: React.FC = () => {
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<string>('API Keys');
  const [apiKey, setApiKey] = useState<string>('pro_live_8f92b10c...a44b');

  const handleSave = (section: string) => {
    notify({
      title: `${section} Updated`,
      description: `Your institutional configuration for ${section} has been securely saved.`,
      status: 'success',
    });
  };

  const handleGenerateKey = () => {
    const newKey = 'pro_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    notify({
      title: 'New API Key Generated',
      description: 'Please copy your new institutional API key. It will not be shown again.',
      status: 'success',
    });
  };

  return (
    <div className="flex-1 p-margin-desktop max-w-container-max mx-auto w-full space-y-unit-xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-display-lg font-display-lg m-0 mb-2 text-on-surface font-bold">Institutional Settings & Support</h1>
        <p className="text-body-lg text-on-surface-variant m-0">Configure your API integrations, webhook endpoints, Midnight RPC nodes, and multi-sig security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Settings Navigation */}
        <div className="lg:col-span-4 space-y-2">
          {['API Keys', 'Webhooks & IP Whitelist', 'Midnight RPC & Wallet', 'Dedicated Support'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-6 py-4 rounded-xl font-bold text-sm border-0 cursor-pointer transition-all flex items-center justify-between ${activeTab === tab ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-surface-container-highest/30 text-on-surface-variant hover:bg-white/5 hover:text-white'}`}
            >
              <span>{tab}</span>
              <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-12 rounded-2xl border-white/10 space-y-8">
          {activeTab === 'API Keys' && (
            <div className="space-y-6">
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0 border-b border-white/10 pb-4">API Keys & Authentication</h2>
              <p className="text-body-md text-on-surface-variant m-0">Use your API key to authenticate automated loan underwriting, zero-knowledge solvency verification, and oracle feeds.</p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">Live Secret Key</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    readOnly 
                    value={apiKey} 
                    className="flex-1 bg-surface-container-highest/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-secondary focus:outline-none" 
                  />
                  <button 
                    onClick={handleGenerateKey}
                    className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl border border-primary/20 cursor-pointer transition-colors text-xs"
                  >
                    Rotate Key
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={() => handleSave('API Configuration')} className="px-8 py-3 bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer text-sm">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'Webhooks & IP Whitelist' && (
            <div className="space-y-6">
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0 border-b border-white/10 pb-4">Webhooks & IP Whitelisting</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">Webhook Endpoint URL</label>
                  <input type="text" defaultValue="https://api.institution.com/v1/credipro-webhook" className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">Whitelisted IP Addresses (CIDR)</label>
                  <textarea rows={3} defaultValue="192.168.1.1/32&#10;10.0.0.0/8" className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-white focus:border-primary focus:outline-none"></textarea>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={() => handleSave('Webhook Settings')} className="px-8 py-3 bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer text-sm">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'Midnight RPC & Wallet' && (
            <div className="space-y-6">
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0 border-b border-white/10 pb-4">Midnight RPC & Custodial Wallet</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">Midnight Fast-Finality RPC Node</label>
                  <input type="text" defaultValue="https://rpc.midnight.network/mainnet/v1/pro" className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-secondary focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">Custodial Partner Integration</label>
                  <select className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none">
                    <option>Fireblocks MPC Vault</option>
                    <option>Anchorage Institutional Custody</option>
                    <option>BitGo Multi-Sig</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={() => handleSave('RPC & Custody Configuration')} className="px-8 py-3 bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer text-sm">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'Dedicated Support' && (
            <div className="space-y-6">
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface m-0 border-b border-white/10 pb-4">Dedicated Institutional Support</h2>
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                    AM
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface m-0 mb-1">Alexander Montgomery</h4>
                    <p className="text-xs text-primary m-0 font-bold">Lead Institutional Account Manager</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant m-0 leading-relaxed">
                  As an AA-tier institutional partner, you have 24/7 direct access to our core cryptographic engineering team and dedicated account management.
                </p>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => notify({ title: 'Support Ticket Created', description: 'Alexander Montgomery has been notified. Expected response: &lt; 15 mins.', status: 'success' })} className="px-6 py-3 bg-primary text-background font-bold rounded-xl border-0 cursor-pointer hover:opacity-90 transition-opacity text-xs">Open Priority Ticket</button>
                  <button onClick={() => notify({ title: 'Secure Call Scheduled', description: 'An encrypted Zoom conference link has been sent to your institutional email.', status: 'info' })} className="px-6 py-3 bg-transparent hover:bg-white/5 text-on-surface font-bold rounded-xl border border-white/10 cursor-pointer transition-colors text-xs">Schedule Secure Call</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
