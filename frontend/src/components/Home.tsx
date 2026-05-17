import React from 'react';

const Home: React.FC = () => {
  const navigateToDashboard = () => {
    window.location.hash = 'dashboard';
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="bg-radial-main text-on-background font-body-md overflow-x-hidden flex-1 flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-md border-b border-white/10 mt-[36px]">
        <div className="flex justify-between items-center w-full px-margin-desktop py-unit-md max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-unit-md cursor-pointer" onClick={() => navigateTo('home')}>
            <img 
              alt="Credipro Logo" 
              className="h-10" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvKQfSv9rR0UY_l95F4mF1fOcx41cJWkVWADZwcsTawSMjlNO0VoKhhwRZLdMv-Sc5R3AQKgzjQmMcPWE-mrVl4CD1fSXY4YB1G_oVifXqqpxE_E-jKybVRLGPCwb5Iggou-S6KlE61zvI9u7R_pHMTNMjMj60pgtRG_HJ296B0zFboHF31YcvQM7QIeOhnZRwitDdQtPdxYL8KxVEnbLVbNs9hthDOVRtxqtBamjtYm5qjJJrt5ATHcQCrSnsnJFOyLw4emQN26A" 
            />
            <span className="text-headline-md font-headline-md font-bold tracking-tight text-on-surface">Credipro</span>
          </div>
          <nav className="hidden md:flex items-center gap-unit-xl">
            <a className="text-label-md font-label-md text-primary font-bold border-b-2 border-primary pb-1 no-underline cursor-pointer" onClick={() => navigateTo('dashboard')}>Markets</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors no-underline cursor-pointer" onClick={() => navigateTo('portfolio')}>Lending</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors no-underline cursor-pointer" onClick={() => navigateTo('portfolio')}>Borrowing</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors no-underline cursor-pointer" onClick={() => navigateTo('docs')}>Security</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors no-underline cursor-pointer" onClick={() => navigateTo('governance')}>Governance</a>
          </nav>
          <div className="flex items-center gap-unit-md">
            <div className="hidden sm:flex gap-unit-sm mr-unit-md">
              <span onClick={() => navigateTo('docs')} className="material-symbols-outlined text-on-surface-variant hover:bg-white/5 p-2 rounded-full cursor-pointer transition-all" data-icon="security">security</span>
              <span onClick={() => navigateTo('transactions')} className="material-symbols-outlined text-on-surface-variant hover:bg-white/5 p-2 rounded-full cursor-pointer transition-all" data-icon="shutter_speed">shutter_speed</span>
            </div>
            <button 
              onClick={navigateToDashboard}
              className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white px-unit-lg py-unit-sm rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95 border-0 cursor-pointer font-bold"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 flex-1">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center min-h-[70vh]">
          <div className="lg:col-span-7 space-y-unit-xl">
            <div className="inline-flex items-center gap-unit-sm px-unit-md py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-label-md font-label-md text-primary uppercase tracking-widest">Mainnet Live on Midnight</span>
            </div>
            <h1 className="font-display-lg text-display-lg leading-tight mb-6 text-on-surface m-0">
              Confidential Institutional <br/>
              <span className="gradient-text">Lending, Powered by Zero-Knowledge</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8 m-0">
              Experience the future of capital markets. Access secure, uncollateralized liquidity through a privacy-first protocol that verifies creditworthiness without ever exposing sensitive institutional data.
            </p>
            <div className="flex flex-wrap gap-unit-lg pt-unit-md">
              <button 
                onClick={navigateToDashboard}
                className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white px-10 py-4 rounded-xl font-headline-md hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] border-0 cursor-pointer font-bold"
              >
                Explore Pools
              </button>
              <button 
                onClick={() => navigateTo('docs')}
                className="glass-panel text-on-surface px-10 py-4 rounded-xl font-headline-md transition-all border cursor-pointer hover:bg-white/5 font-bold"
              >
                Read Whitepaper
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            {/* Glowing Glass Card Visual */}
            <div className="glass-panel p-unit-xl rounded-[2rem] border-white/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 shimmer-purple opacity-20"></div>
              <div className="flex justify-between items-start mb-unit-xl">
                <div className="space-y-unit-xs">
                  <p className="text-label-md font-label-md text-on-surface-variant m-0">Lending Pool ID</p>
                  <p className="font-mono-data text-mono-data text-secondary m-0 font-bold">ZKP-PRO-9921-X</p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-4xl" data-icon="verified_user">verified_user</span>
              </div>
              <div className="space-y-unit-lg">
                <div className="p-unit-md rounded-xl bg-surface-container-highest/50 border border-white/5 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-body-md text-on-surface-variant">Protocol APY</span>
                    <span className="text-headline-md font-headline-md text-emerald-400 font-bold">12.45%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-tertiary h-full w-3/4"></div>
                  </div>
                </div>
                <div className="flex gap-unit-md mb-6">
                  <div className="flex-1 p-unit-md rounded-xl bg-surface-container-highest/50 border border-white/5">
                    <p className="text-label-md text-on-surface-variant m-0 mb-1">ZK Proof Status</p>
                    <p className="text-body-md font-bold text-secondary flex items-center gap-2 m-0">
                      <span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                      Verified
                    </p>
                  </div>
                  <div className="flex-1 p-unit-md rounded-xl bg-surface-container-highest/50 border border-white/5">
                    <p className="text-label-md text-on-surface-variant m-0 mb-1">Vault Risk</p>
                    <p className="text-body-md font-bold text-on-surface m-0">Minimal (AA)</p>
                  </div>
                </div>
              </div>
              <div className="mt-unit-xl pt-unit-lg border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">IB</div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">JP</div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-tertiary/20 flex items-center justify-center text-[10px] font-bold text-tertiary">GS</div>
                </div>
                <span className="text-label-md text-on-surface-variant">32 Institutions Active</span>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="mt-unit-xl py-12 border-y border-white/5 bg-surface-container-lowest/30 backdrop-blur-sm my-16">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-unit-xl">
            <div className="text-center space-y-1">
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest m-0 mb-2">Total Value Locked</p>
              <p className="font-display-lg text-headline-lg font-bold text-on-surface m-0">$142,850,000</p>
            </div>
            <div className="text-center space-y-1 md:border-x border-white/5 my-6 md:my-0">
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest m-0 mb-2">Active Liquidity</p>
              <p className="font-display-lg text-headline-lg font-bold text-primary m-0">$89,400,000</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest m-0 mb-2">Default Rate</p>
              <p className="font-display-lg text-headline-lg font-bold text-emerald-400 m-0">0.00%</p>
            </div>
          </div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section className="py-24 max-w-container-max mx-auto px-margin-desktop mb-16">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4 m-0 font-bold">Institutional Infrastructure</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto m-0">Built for the demanding requirements of global financial institutions with zero compromises on compliance or security.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div className="glass-panel p-unit-lg rounded-2xl flex flex-col items-start gap-unit-md group transition-all duration-500">
              <div className="p-4 rounded-xl bg-secondary-container/20 text-secondary border border-secondary/20 mb-unit-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl" data-icon="shield_with_heart">shield_with_heart</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface m-0 mb-2 font-bold">Shielded Credit Scoring</h3>
              <p className="text-body-md text-on-surface-variant m-0 mb-6">Utilize Zero-Knowledge Proofs to verify credit history and solvency without revealing balance sheets or transaction history to the public ledger.</p>
              <div className="mt-auto pt-unit-lg w-full">
                <a onClick={() => navigateTo('docs')} className="text-label-md text-primary flex items-center gap-2 hover:gap-3 transition-all no-underline font-bold cursor-pointer">
                  Learn more <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                </a>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="glass-panel p-unit-lg rounded-2xl flex flex-col items-start gap-unit-md group transition-all duration-500">
              <div className="p-4 rounded-xl bg-tertiary-container/20 text-tertiary border border-tertiary/20 mb-unit-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl" data-icon="query_stats">query_stats</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface m-0 mb-2 font-bold">Oracle Slashing</h3>
              <p className="text-body-md text-on-surface-variant m-0 mb-6">Automated risk management through decentralized oracles that monitor off-chain performance and trigger instantaneous collateral adjustments.</p>
              <div className="mt-auto pt-unit-lg w-full">
                <a onClick={() => navigateTo('governance')} className="text-label-md text-primary flex items-center gap-2 hover:gap-3 transition-all no-underline font-bold cursor-pointer">
                  View oracles <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                </a>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="glass-panel p-unit-lg rounded-2xl flex flex-col items-start gap-unit-md group transition-all duration-500">
              <div className="p-4 rounded-xl bg-primary-container/20 text-primary border border-primary/20 mb-unit-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl" data-icon="policy">policy</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface m-0 mb-2 font-bold">Regulatory Compliance</h3>
              <p className="text-body-md text-on-surface-variant m-0 mb-6">Full KYC/AML integration with permissioned pools. Prove compliance to regulators while maintaining institutional trade secrecy.</p>
              <div className="mt-auto pt-unit-lg w-full">
                <a onClick={() => navigateTo('docs')} className="text-label-md text-primary flex items-center gap-2 hover:gap-3 transition-all no-underline font-bold cursor-pointer">
                  Compliance docs <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Visual Break */}
        <section className="max-w-container-max mx-auto px-margin-desktop mb-24">
          <div className="glass-panel rounded-[3rem] p-unit-xl relative overflow-hidden bg-gradient-to-br from-surface-container-high/40 to-surface-container-lowest/80 border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
              <img 
                alt="Abstract digital background" 
                className="w-full h-full object-cover mix-blend-overlay" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsg-b9NZgWZoy6fWqzqUWkIZge1U9MiNze52NU7thcLhr533DlsHgIsquvJ7WoKPFD7un-NyNCn4FtBSy7CBGjiX6xkzN1rnB9dcJbHzj7QVmve6sO0oyO719posA0EktBL5SPIm7ifsAtq9pGwF3Py0WTmkJtv8kkxTdvRVnYctc6IcaONUrR_x8LquIB13SXqMXEuAuHUGufnkufOlSvY9QLawlDjewwNkNMY5U7eq9sGvP01kEt1LpbQDDBdRPmOpfutvTQ3i4"
              />
            </div>
            <div className="relative z-10 lg:w-3/5">
              <h2 className="text-display-lg font-display-lg mb-unit-lg text-on-surface m-0 mb-6 font-bold">Ready to transform your capital efficiency?</h2>
              <p className="text-body-lg text-on-surface-variant mb-unit-xl m-0 mb-8">Join the most secure institutional credit market on-chain. Experience uncollateralized lending without sacrificing privacy or compliance.</p>
              <div className="flex flex-wrap gap-unit-md">
                <button 
                  onClick={navigateToDashboard}
                  className="bg-white text-background px-unit-xl py-4 rounded-xl font-headline-md hover:bg-primary transition-all border-0 cursor-pointer font-bold"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => navigateTo('settings')}
                  className="text-on-surface px-unit-xl py-4 rounded-xl font-headline-md border border-white/10 hover:bg-white/5 bg-transparent cursor-pointer font-bold transition-colors"
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 pt-20 pb-10">
        <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-unit-xl mb-16">
          <div className="col-span-1 space-y-unit-lg">
            <div className="flex items-center gap-unit-md mb-4 cursor-pointer" onClick={() => navigateTo('home')}>
              <img 
                alt="Credipro Logo" 
                className="h-8" 
                src="https://lh3.googleusercontent.com/a" 
              />
              <span className="text-headline-md font-headline-md font-bold text-on-surface">Credipro</span>
            </div>
            <p className="text-body-md text-on-surface-variant m-0 mb-6">The institutional standard for privacy-preserving credit markets. Secured by Midnight and Zero-Knowledge Proofs.</p>
            <div className="flex gap-unit-md">
              <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigateTo('home')}><span className="material-symbols-outlined" data-icon="language">language</span></a>
              <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigateTo('dashboard')}><span className="material-symbols-outlined" data-icon="hub">hub</span></a>
            </div>
          </div>
          <div className="space-y-unit-lg">
            <p className="text-label-md font-bold text-on-surface uppercase tracking-widest m-0 mb-4">Protocol</p>
            <nav className="flex flex-col gap-unit-sm">
              <a onClick={() => navigateTo('dashboard')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Markets</a>
              <a onClick={() => navigateTo('portfolio')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Yield Pools</a>
              <a onClick={() => navigateTo('portfolio')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Borrowing</a>
              <a onClick={() => navigateTo('governance')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Governance</a>
            </nav>
          </div>
          <div className="space-y-unit-lg">
            <p className="text-label-md font-bold text-on-surface uppercase tracking-widest m-0 mb-4">Resources</p>
            <nav className="flex flex-col gap-unit-sm">
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Whitepaper</a>
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Documentation</a>
              <a href="https://github.com/Credipro" target="_blank" rel="noreferrer" className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Github</a>
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Security Audits</a>
            </nav>
          </div>
          <div className="space-y-unit-lg">
            <p className="text-label-md font-bold text-on-surface uppercase tracking-widest m-0 mb-4">Legal</p>
            <nav className="flex flex-col gap-unit-sm">
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Privacy Policy</a>
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Terms of Service</a>
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Compliance</a>
              <a onClick={() => navigateTo('docs')} className="text-body-md text-on-surface-variant hover:text-tertiary transition-colors no-underline pb-2 cursor-pointer">Cookie Policy</a>
            </nav>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-margin-desktop pt-unit-lg border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-unit-md">
          <p className="text-label-md font-label-md text-on-surface-variant opacity-80 m-0">© 2024 Credipro Protocol. All proofs verified.</p>
          <div className="flex items-center gap-unit-md text-label-md text-on-surface-variant">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Status: Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
