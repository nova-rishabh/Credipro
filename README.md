# Credipro: Privacy-Preserving Decentralized Lending on Midnight Network

![Midnight Network](https://img.shields.io/badge/Built%20on-Midnight%20Network-blue)
![Language](https://img.shields.io/badge/Language-Compact-purple)
![Status](https://img.shields.io/badge/Status-MVP-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

**Credipro** is a decentralized lending protocol that solves the "Sybil default paradox" in Web3 uncollateralized lending. It connects institutional underwriters with retail borrowers through a **privacy-preserving, zero-knowledge proof-based underwriting model** built on Midnight Network's Kachina protocol.

### The Problem

Traditional Web3 lending protocols face a critical vulnerability: malicious actors can:
1. Generate multiple anonymous identities (DIDs)
2. Obtain undercollateralized loans for each identity
3. Default without real-world consequences
4. Repeat the attack infinitely, bankrupting the protocol

Credipro solves this by **binding cryptographic proofs of real-world identity to loans**, enabling selective identity reveal only to affected underwriters upon default—backed by legal enforcement through an off-chain Master Loan Agreement (MLA).

### The Solution

Credipro uses **three core innovations**:

1. **Zero-Knowledge Proof of Creditworthiness**
   - Borrowers prove their FICO score meets minimum thresholds **without revealing the actual score**
   - Powered by zkTLS oracle integration (or mock for MVP)
   - Generates zk-SNARKs using BLS12-381 elliptic curves

2. **Cryptographic Identity Binding**
   - User identity is hashed and committed on-chain
   - Actual name, ID, and biometrics remain strictly private (off-chain only)
   - Prevents Sybil attacks through unique identity commitment per loan

3. **Selective Identity Reveal with Oracle Consensus**
   - Upon default, a 2-of-3 trusted oracle committee votes
   - Only when consensus (≥2 of 3) is reached does the identity decrypt
   - Identity revealed **exclusively to the affected underwriter** for legal recourse
   - Backed by signed Master Loan Agreement defining jurisdiction and enforcement terms

---

## Phase 3 Hardening & Production Infrastructure (May 16, 2026 Update)

To transition Credipro from a hackathon proof-of-concept to a secure, auditable, production-ready protocol, we have completed a comprehensive architectural hardening sprint addressing key technical debt and security vectors:

1. **Persistent SQLite Storage (`credipro.sqlite`)**
   - Eliminated volatile in-memory `Map` data structures across the backend.
   - Initialized a robust SQLite database layer (`backend/src/db.ts`) with dedicated relational schemas for `borrowers`, `identities`, and `oracle_votes`.
   - Enabled durable state persistence across server restarts and concurrent client requests.

2. **ZK-Friendly Cryptography (`poseidon-goldilocks`)**
   - Deprecated vulnerable Node.js `crypto.createHash('sha256')` mock implementations.
   - Integrated Plonky2-compatible `poseidon-goldilocks` hashing (`hashNoPad`) across the credit bureau, identity provider, prover witness context, and smart contract client layers.
   - Aligned off-chain hash generation with the exact cryptographic arithmetic required by Midnight ZK circuits.

3. **Structured Observability (`winston`)**
   - Replaced all legacy `console.log`, `console.warn`, and `console.error` statements with an enterprise-grade Winston logging pipeline (`backend/src/logger.ts`).
   - Configured custom formatting with timestamped console transports and dedicated file logs (`logs/error.log`, `logs/combined.log`) for complete auditability.

4. **Strict JWT Authentication & Zero-Bypass Security**
   - Removed the insecure `DISABLE_AUTH` developer bypass flag.
   - Enforced strict JWT verification middleware (`backend/src/server.ts`) across all protected API routes.
   - Implemented a dedicated `/api/auth/token` authentication endpoint issuing cryptographically signed JSON Web Tokens (`JWT_SECRET`) for authorized borrower sessions.

5. **Fully Asynchronous Service Architecture**
   - Upgraded all oracle, bureau, and committee service methods (`MockOracleService`, `MockCreditBureau`, `MockIdentityProvider`) to fully asynchronous `async/await` signatures to support real database I/O and future zkTLS network calls.

---

## Quick Start

### Prerequisites

- Node.js 18+ (for TypeScript SDK)
- Midnight Network testnet wallet (e.g., Lace Wallet)
- Compact language compiler (v0.16–v0.21)
- `midnight-js` SDK (latest version)

### Installation

```bash
# Clone the repository
git clone https://github.com/nova-rishabh/Credipro.git
cd Credipro

# Install all workspace dependencies (backend + frontend)
npm install

# Copy environment template and set JWT_SECRET
cp .env.example .env

# Compile Compact smart contract & backend
npm run compile:contract
npm run build
```

### Running the Application

**Option A — Local development (two terminals)**

**Terminal 1: Backend API** (nodemon — recompiles & restarts on `backend/src` changes, port 3001)
```bash
npm run start:backend
```

**Terminal 2: React frontend** (CRA dev server on port 3000)
```bash
npm run start:frontend
```

**Option B — Docker Compose** (frontend on :3000, backend API on :3001)
```bash
docker compose up --build
# Open http://localhost:3000
```

*(Note: The frontend uses `react-app-rewired` to polyfill Node.js core modules like `crypto` required by the Midnight SDK in the browser).*

### Project layout

```
Credipro/
├── backend/
│   └── src/
│       ├── config/       # Client singleton & env
│       ├── lib/          # logger, db
│       ├── middleware/   # JWT auth
│       ├── routes/       # API routes
│       ├── services/     # contract, oracle, prover
│       ├── types/
│       ├── app.ts
│       └── server.ts
├── frontend/             # React SPA (port 3000)
├── contracts/
└── docker-compose.yml
```

### Midnight Lace Wallet Setup

Since Credipro is built on the Midnight Network, you **must** have the official wallet extension installed to interact with the decentralized application.

1. Open a Chromium-based browser (Chrome, Edge, Brave).
2. Go to the Chrome Web Store and search for **Lace Wallet** (or visit the official Midnight Network resources).
3. Install the extension and pin it to your toolbar.
4. Open the extension, follow the onboarding to create a new test wallet, and securely back up your seed phrase.
5. In the Lace Wallet settings, ensure your network is set to **Midnight Testnet**.
6. Refresh the Credipro application at `http://localhost:3000`. The "Connect Wallet" button will now successfully link your Lace Wallet to the dApp!

### Example: Request a Loan

```typescript
import { CrediproContract } from './contracts/Credipro';
import { Lace } from '@midnight-ntwrk/lace-sdk';

// 1. Connect wallet
const wallet = await Lace.connect();
const borrower = wallet.getAddress();

// 2. Prepare witness data (off-chain, local)
const creditScore = 720;  // Mock FICO score
const passport = await readEncryptedPassport();  // Local NFC or storage

// 3. Request loan
const loanId = await contract.requestLoan(
  BigInt(100000),           // loanAmount (in smallest denomination)
  underwriterAddress,       // poolAddress
  BigInt(180)               // defaultTermDays
);

console.log(`Loan approved! ID: ${loanId}`);
```

---

## Architecture

### Three-Context Partition (Midnight Kachina Protocol)

```
┌─────────────────────────────────────────────────────────┐
│ Credipro Smart Contract Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  LEDGER CONTEXT (Public, On-Chain)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • liquidityPools: Pool TVL tracking               │  │
│  │ • publicRiskParameters: Min credit scores, LTV    │  │
│  │ • encryptedIdentityCommitments: Loan records     │  │
│  │ • oracleCommitteeSignatures: Default votes       │  │
│  └───────────────────────────────────────────────────┘  │
│                           ↑                              │
│                        disclose()                        │
│                           ↓                              │
│  WITNESS CONTEXT (Private, Off-Chain)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • mock_zkTLS_CreditScore(): Borrower's FICO      │  │
│  │ • read_Identity_NFC(): Encrypted passport        │  │
│  │ • compute_identity_hash(): Local hash derivation │  │
│  │ • check_default_deadline_exceeded(): Time check  │  │
│  └───────────────────────────────────────────────────┘  │
│                           ↑                              │
│                    Assertions & Proofs                   │
│                           ↓                              │
│  CIRCUIT CONTEXT (ZK Prover)                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • requestLoan(): Underwriting circuit             │  │
│  │ • triggerSlashing(): Default resolution circuit  │  │
│  │ • verify_master_loan_agreement(): MLA validation │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### requestLoan() Circuit

**Purpose:** Generate ZK proof that borrower meets lender's risk parameters.

```
INPUT: loanAmount, poolAddress, defaultTermDays
OUTPUT: loanId (Bytes<32>)

LOGIC:
  1. Retrieve witness data (creditScore, identity, lender)
  2. Fetch public risk parameters from ledger
  3. Assert: disclose(creditScore >= minCreditScore)
  4. Assert: disclose(loanAmount <= poolTVL)
  5. Compute identity commitment hash
  6. Create loan record on ledger
  7. Return loan ID
  
ZERO-KNOWLEDGE:
  ✓ Verifier learns: Loan was approved
  ✗ Verifier does NOT learn: Actual credit score, income, real identity
```

### triggerSlashing() Circuit

**Purpose:** Prove default conditions met, trigger identity reveal.

```
INPUT: loanId
OUTPUT: (none, updates ledger state)

LOGIC:
  1. Retrieve loan record
  2. Assert: disclose(!isDefaulted)  [Not already defaulted]
  3. Assert: disclose(deadlineExceeded)  [Past due]
  4. Assert: disclose(oracleApprovals >= 2)  [Consensus reached]
  5. Mark isDefaulted = true
  6. Trigger off-chain oracle decryption
  
ZERO-KNOWLEDGE:
  ✓ Circuit proves conditions are met
  ✗ Circuit does NOT decrypt identity (off-chain oracle action)
```

---

## Core Features

### ✅ Privacy-Preserving Underwriting

- **No raw credit data on-chain:** Only ZK proofs of creditworthiness
- **Identity hidden by default:** Only hash commitment on ledger
- **Witness data stays local:** Never exposed without explicit `disclose()`

### ✅ Sybil Attack Prevention

- **Cryptographic identity binding:** Each loan tied to unique identity hash
- **One identity = one loan per underwriter:** Prevents duplicate loans
- **Real-world enforcement:** MLA + selective reveal creates legal deterrent

### ✅ Institutional-Grade Privacy

- **Rational privacy framework:** Data shielded by default, selectively disclosed for compliance
- **Underwriter anonymity:** Risk parameters are public; portfolio composition stays private
- **Selective reveal only to affected lender:** Other participants remain blind

### ✅ Hackathon MVP Scope

- **Mock zkTLS oracle:** Simulates credit score verification (replaceable with real zkTLS)
- **2-of-3 oracle committee:** Simplified threshold consensus (scalable to N-party MPC in Phase 2)
- **Master Loan Agreement:** Off-chain legal enforcement for real-world collections

---

## Project Structure

```
Credipro/
├── backend/                          # Express API + Midnight SDK (port 3001)
├── frontend/                         # React SPA (port 3000)
├── contracts/
│   └── Credipro.compact              # Smart contract (MVP-complete)
├── docs/                             # Product & technical documentation
├── docker-compose.yml                # Backend + frontend stack
└── README.md
```

---

## Development Roadmap

### Phase 1: MVP (Hackathon, May 2026)

- [x] Compact smart contract (requestLoan + triggerSlashing circuits)
- [x] Contract specification & documentation
- [x] TypeScript witness implementations
- [x] React frontend
- [x] Lace Wallet integration
- [x] Mock zkTLS oracle
- [x] End-to-end testing

### Phase 2: Production Features (Q3 2026)

- [ ] Real zkTLS oracle integration (zkPass, Reclaim Protocol)
- [ ] True 2-of-3 threshold decryption (BLS signatures)
- [ ] Loan repayment logic
- [ ] Interest accrual & fees
- [ ] MerkleTree for identity proofs
- [ ] Zswap integration for fund transfers

### Phase 3: Advanced Features (Q4 2026+)

- [ ] Full N-party MPC threshold decryption
- [ ] Secondary loan market & trading
- [ ] Cross-chain bridging (Ethereum, Polygon)
- [ ] Loan securitization
- [ ] DAO governance for oracle committee selection

---

## Security Considerations

### Sybil Attack Prevention

**Threat:** Attacker generates multiple DIDs, gets loans, defaults on all.

**Mitigation:**
- Each loan is cryptographically bound to a unique identity hash
- Upon default, identity can be revealed (with oracle consensus)
- Master Loan Agreement provides legal jurisdiction for real-world enforcement
- Attacker's real identity becomes discoverable, creating deterrent

### Oracle Centralization Risk

**Threat:** 2-of-3 oracle committee could be compromised or collude.

**Mitigation:**
- Circuit **proves conditions are met** (deadline + approvals) — oracle cannot forge proofs
- Identity reveal happens **off-chain** — oracle cannot leak to other participants
- Master Loan Agreement **provides legal recourse** against rogue oracles
- Phase 2: True N-party MPC threshold decryption eliminates single-point-of-failure

### Privacy Preservation

**Threat:** Underwriter's risk parameters leak to competitors.

**Mitigation:**
- `publicRiskParameters` are **intentionally public** (set by underwriter)
- Underwriter controls what parameters are exposed
- Portfolio composition and proprietary data **never** on-chain

---

## Integration Guide

### For Borrowers

1. **Wallet Setup & Onboarding**
   - Install the **Lace Wallet** extension from the Chrome Web Store.
   - Create a test wallet and switch to the **Midnight Testnet**.
   - Navigate to `http://localhost:3000` and click **Connect Wallet**.
   - Sign the Master Loan Agreement (off-chain, legal contract).
   - Store encrypted identity locally (NFC passport chip or secure storage).

2. **Loan Request**
   - Mock-authenticate with credit bureau (zkTLS or mock oracle)
   - Prover generates ZK proof of creditworthiness locally
   - Submit proof to contract via `requestLoan()` circuit
   - Receive loan ID upon approval

3. **Repayment**
   - Monitor loan term
   - Repay via Zswap (private token transfer)
   - Upon full repayment, loan closes and identity commitment removed

### For Underwriters

1. **Pool Setup**
   - Deploy liquidity pool (set TVL)
   - Define public risk parameters (min credit score, max LTV, min income)

2. **Loan Approval**
   - Monitor incoming loan requests
   - Disburse funds via Zswap upon circuit approval

3. **Default Resolution**
   - Vote on default resolutions (2-of-3 oracle committee)
   - Upon consensus, receive decrypted identity (via off-chain oracle)
   - Verify Master Loan Agreement and pursue legal collections

### For Oracle Committee

1. **Default Voting**
   - Monitor flagged loans (past deadline)
   - Vote to approve or reject default resolution

2. **Identity Decryption**
   - Upon 2-of-3 consensus, perform decryption
   - Send encrypted identity to affected underwriter

3. **Audit Trail**
   - Maintain logs of all votes and decryptions
   - Support legal proceedings if needed

---

## Testing

### Run Tests

```bash
# Unit tests for smart contract
npm test

# Integration tests (end-to-end flow)
npm test:integration

# Compile & validate Compact syntax
npm run compile:contract

# Generate test coverage
npm test:coverage
```

### Example Test Cases

```typescript
// ✓ requestLoan succeeds when credit score meets threshold
// ✓ requestLoan fails when credit score below threshold
// ✓ requestLoan creates identity commitment
// ✓ triggerSlashing succeeds when deadline exceeded + oracle consensus
// ✓ triggerSlashing fails if deadline not exceeded
// ✓ triggerSlashing fails if oracle consensus not reached
// ✓ verify_master_loan_agreement succeeds with valid signature
// ✓ Identity remains private until default resolution
```

---

## Contributing

1. **Fork the repository**
   ```bash
   git fork https://github.com/nova-rishabh/Credipro.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes** and ensure tests pass
   ```bash
   npm test
   ```

4. **Submit a pull request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure CI checks pass

### Code Style

- **Compact:** Follow the official Compact style guide
  - Use `disclose()` explicitly for all sensitive data
  - No implicit disclosures
  - Proper pragma syntax: `pragma language_version >= 0.16 && <= 0.21;`

- **TypeScript:** ESLint + Prettier configuration
  ```bash
  npm run lint
  npm run format
  ```

---

## Documentation

- **[SMART_CONTRACT_SPEC.md](./docs/SMART_CONTRACT_SPEC.md)** — Complete contract specification (500+ lines)
  - Ledger/Witness/Circuit context details
  - Data type definitions & invariants
  - Security analysis & threat models
  - Integration guide for SDK

- **[MVP_DELIVERABLES.md](./docs/MVP_DELIVERABLES.md)** — Integration checklist (300+ lines)
  - TypeScript witness stubs
  - Circuit call examples
  - Next steps & priorities
  - Known limitations

- **[PRD.md](./docs/PRD.md)** — Product Requirements Document
  - Problem statement & market opportunity
  - Core mechanics & user flows
  - Feature scope (MVP vs. Phase 2+)

- **[TRD.md](./docs/TRD.md)** — Technical Requirements Document
  - Technology stack (Compact, Midnight, Kachina)
  - Architecture constraints
  - Performance targets

---

## License

MIT License — See [LICENSE](./LICENSE) file for details.

---

## Support

### Get Help

- **Documentation:** See `/Docs` folder and `.md` files
- **Issues:** [GitHub Issues](https://github.com/nova-rishabh/Credipro/issues)
- **Discussions:** [GitHub Discussions](https://github.com/nova-rishabh/Credipro/discussions)

### Midnight Network Resources

- **Official Docs:** https://docs.midnight.network
- **Compact Reference:** https://docs.midnight.network/develop/reference/compact/lang-ref
- **SDK:** https://www.npmjs.com/package/@midnight-ntwrk/compact-js

---

## Acknowledgments

Built with ❤️ for the Midnight Network hackathon (May 2026).

Special thanks to:
- **Midnight Team** for the Kachina protocol & Compact language
- **Lace Wallet** for seamless integration
- **zkTLS/zkPass** community for privacy-preserving oracle designs

---

## Roadmap Highlights

| Milestone | Date | Focus |
|-----------|------|-------|
| **MVP Launch** | May 2026 | Hackathon demo (requestLoan + triggerSlashing) |
| **Phase 2** | Q3 2026 | Real zkTLS + True MPC threshold decryption |
| **Phase 3** | Q4 2026 | Cross-chain bridging + Secondary market |
| **Phase 4** | 2027 | Mainnet launch + DAO governance |

---

**Status:** ✅ MVP Complete — Ready for Development

**Last Updated:** May 16, 2026
