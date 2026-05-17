import React, { useState } from 'react';

const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Whitepaper');

  const tabs = [
    'Whitepaper',
    'ZK Circuits & Poseidon',
    'Oracle Slashing',
    'Regulatory Compliance',
    'Security Audits',
    'Privacy Policy & Terms',
  ];

  const content: Record<string, { title: string; body: React.ReactNode }> = {
    'Whitepaper': {
      title: 'Credipro Protocol Whitepaper v1.2',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            The Institutional Standard for Confidential, Uncollateralized Lending on the Midnight Blockchain.
          </p>
          <p>
            Credipro introduces a groundbreaking cryptographic architecture enabling global financial institutions to access uncollateralized liquidity without exposing proprietary balance sheets, trading strategies, or credit scores to public ledgers.
          </p>
          <h4 className="text-on-surface font-bold text-headline-md pt-4">1. The Privacy-Utility Dilemma in DeFi</h4>
          <p>
            Traditional decentralized finance (DeFi) requires complete transparency: every transaction, collateral ratio, and liquidation event is broadcast to the entire world. For institutional borrowers, this public exposure creates unacceptable trade secrecy risks, front-running vulnerabilities, and regulatory friction.
          </p>
          <h4 className="text-on-surface font-bold text-headline-md pt-4">2. Zero-Knowledge Solvency Proofs</h4>
          <p>
            By leveraging advanced ZK-SNARKs and the Midnight confidential ledger, Credipro allows institutions to prove off-chain creditworthiness, historical solvency, and AA-tier risk compliance through mathematical proofs. The public ledger only records a verified Merkle root and Poseidon hash receipt.
          </p>
        </div>
      ),
    },
    'ZK Circuits & Poseidon': {
      title: 'Zero-Knowledge Circuits & Poseidon Hashing',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            Mathematical Guarantees for Confidential Verification.
          </p>
          <p>
            All credit scoring and solvency verification circuits are written in Compact and compiled to Midnight ZK-SNARKs. To ensure compatibility with arithmetic circuits and minimize constraint complexity, Credipro utilizes the Poseidon hash function for all state commitments.
          </p>
          <div className="p-6 bg-surface-container-highest/50 rounded-xl border border-white/10 font-mono text-xs text-secondary space-y-2">
            <p className="text-white font-bold">{'// Compact Circuit Specification'}</p>
            <p>circuit verify_solvency(private_balance: Field, debt: Field, merkle_proof: Array) &#123;</p>
            <p className="pl-4">assert private_balance &gt;= debt * 125 / 100;</p>
            <p className="pl-4">let leaf = poseidon_hash([private_balance, debt]);</p>
            <p className="pl-4">assert verify_merkle_root(leaf, merkle_proof);</p>
            <p>&#125;</p>
          </div>
        </div>
      ),
    },
    'Oracle Slashing': {
      title: 'Decentralized Oracle Committee & Slashing Mechanics',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            Automated Off-Chain Risk Management.
          </p>
          <p>
            A permissioned committee of 32 institutional oracle nodes continuously monitors off-chain credit events, real-world asset (RWA) valuations, and banking API feeds. Consensus requires a 67% supermajority signed via BLS aggregate signatures.
          </p>
          <p>
            Any oracle node submitting malicious or erroneous data faces instantaneous slashing of their staked vePRO tokens, which are redistributed to the protocol safety module.
          </p>
        </div>
      ),
    },
    'Regulatory Compliance': {
      title: 'Institutional KYC/AML & Regulatory Compliance',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            Bridging Decentralized Privacy with Global Compliance.
          </p>
          <p>
            Credipro operates permissioned liquidity pools where every participant must undergo rigorous KYC/AML onboarding through accredited custodial partners (e.g., Fireblocks, Anchorage).
          </p>
          <p>
            Using Zero-Knowledge compliance receipts, institutions can instantly prove to regulatory auditors (SEC, FINRA, MiCA) that all counterparties in a pool are fully verified, without revealing the specific identities of those counterparties to the public.
          </p>
        </div>
      ),
    },
    'Security Audits': {
      title: 'Smart Contract Security & Formal Verification',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            Audited by Industry-Leading Cryptographic Researchers.
          </p>
          <p>
            The Credipro smart contracts, Poseidon hashing libraries, and Compact ZK circuits have undergone rigorous formal verification and manual code audits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 bg-surface-container-highest/50 rounded-xl border border-white/10 space-y-2">
              <h5 className="font-bold text-on-surface text-base m-0">Trail of Bits</h5>
              <p className="text-xs text-emerald-400 m-0 font-bold">Completed: October 2025 | Score: 100%</p>
              <p className="text-xs text-on-surface-variant m-0">Full audit of Midnight Compact circuits and Poseidon gadget constraints.</p>
            </div>
            <div className="p-6 bg-surface-container-highest/50 rounded-xl border border-white/10 space-y-2">
              <h5 className="font-bold text-on-surface text-base m-0">OpenZeppelin</h5>
              <p className="text-xs text-emerald-400 m-0 font-bold">Completed: January 2026 | Score: 100%</p>
              <p className="text-xs text-on-surface-variant m-0">Audit of DAO governance, vePRO staking, and oracle slashing mechanics.</p>
            </div>
          </div>
        </div>
      ),
    },
    'Privacy Policy & Terms': {
      title: 'Legal, Privacy Policy & Terms of Service',
      body: (
        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <p className="text-body-lg text-on-surface font-bold">
            Commitment to Data Secrecy and Protocol Integrity.
          </p>
          <p>
            By accessing the Credipro protocol, participants agree to the decentralized terms of service. All zero-knowledge proofs generated locally remain entirely on the client machine until broadcast as cryptographic commitments.
          </p>
          <p>
            Credipro does not log IP addresses, institutional wallet metadata, or private credit scoring inputs.
          </p>
        </div>
      ),
    },
  };

  return (
    <div className="flex-1 p-margin-desktop max-w-container-max mx-auto w-full">
      <div className="border-b border-white/10 pb-6 mb-12">
        <h1 className="text-display-lg font-display-lg m-0 mb-2 text-on-surface font-bold">Documentation & Compliance</h1>
        <p className="text-body-lg text-on-surface-variant m-0">Complete technical specifications, cryptographic proofs, and regulatory frameworks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          {tabs.map((tab) => (
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

        {/* Content Area */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-12 rounded-2xl border-white/10 space-y-6">
          <h2 className="text-headline-lg font-headline-lg font-bold text-on-surface m-0 border-b border-white/10 pb-6">
            {content[activeTab]?.title}
          </h2>
          {content[activeTab]?.body}
        </div>
      </div>
    </div>
  );
};

export default Docs;
