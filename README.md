# Credipro: Privacy-Preserving Decentralized Lending on Midnight Network

**Zero-knowledge undercollateralized lending with selective identity disclosure upon default — built on Midnight's Kachina protocol.**

[![Built on Midnight](https://img.shields.io/badge/Built%20on-Midnight%20Network-6B3FA0?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDd2MTBsMTAgNSAxMC01VjdsLTEwLTV6IiBmaWxsPSIjNkIzRkEwIi8+PC9zdmc+)](https://midnight.network)
[![Language](https://img.shields.io/badge/Language-Compact-purple)](https://docs.midnight.network/develop/reference/compact/lang-ref)
[![Tests](https://img.shields.io/badge/Tests-54%20passing-brightgreen)](https://github.com/nova-rishabh/Credipro)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## The Problem

Uncollateralized lending in Web3 suffers from the **Sybil default paradox**: since on-chain identities are pseudonymous, a malicious borrower can create multiple wallets, take undercollateralized loans against each, default on all of them, and repeat — with zero real-world accountability. Overcollateralized lending (e.g., Aave, Compound) avoids this but locks up >150% of the loan value in collateral, which is capital-inefficient for creditworthy borrowers.

## The Solution: Credipro

Credipro binds cryptographic proofs of real-world identity to loans via **Midnight's Kachina protocol**, enabling:

- **ZK-proof of creditworthiness** — borrowers prove their credit score meets the pool's threshold without revealing the actual score
- **Identity commitment with selective reveal** — a hash of the borrower's identity is committed on-chain; the raw identity remains off-chain and encrypted
- **2-of-3 oracle slashing mechanism** — upon verified default, the oracle committee decrypts the identity and reveals it **exclusively to the affected underwriter** for legal recourse via a signed Master Loan Agreement (MLA)

---

## Architecture

### Three-Context Kachina Partition

```
LEDGER CONTEXT (Public On-Chain)
├── liquidityPools: Map<Bytes32, Uint64>           # Pool TVL
├── publicRiskParameters: Map<Bytes32, PublicRiskParam>  # Min credit score, max LTV
├── encryptedIdentityCommitments: Map<Bytes32, LoanIdentityRecord>  # Loan records
└── oracleCommitteeSignatures: Map<Bytes32, Uint<3>>  # Default votes

WITNESS CONTEXT (Private Off-Chain)
├── mock_zkTLS_CreditScore() → Uint<850>           # FICO score (zkTLS in prod)
├── read_Identity_NFC() → Opaque<Uint8Array>       # Encrypted passport
├── compute_identity_hash() → Bytes32              # Local hash derivation
├── check_default_deadline_exceeded() → Boolean     # Past-due check
└── verify_mla_signature() → Boolean               # MLA signature verification

CIRCUIT CONTEXT (ZK Prover)
├── requestLoan(loanAmount, poolAddress, defaultTermDays) → Bytes32
├── triggerSlashing(loanId) → []
└── verify_master_loan_agreement(borrowerPK, mlHash, signature) → []
```

### Core Circuits

**`requestLoan`** — Underwriting circuit. The borrower generates a ZK proof that their credit score >= `minCreditScore` and loan amount <= pool TVL, without revealing the actual score or identity. A `LoanIdentityRecord` is committed to the ledger with a hash of the encrypted identity. Verifier learns: loan was approved, loan ID. Verifier does **not** learn: actual credit score, income, real identity.

**`triggerSlashing`** — Default resolution circuit. Fires only when (1) the loan is past due and (2) ≥2 of 3 oracle committee members have voted to confirm the default. Marks the loan `isDefaulted = true` on-chain and triggers off-chain decryption of the borrower's identity for the underwriter.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | **Compact** (Midnight's ZK language, `pragma >= 0.16 && <= 0.23`) |
| ZK Runtime | **@midnight-ntwrk/compact-runtime**, **@midnight-ntwrk/midnight-js-contracts** |
| Hashing | **poseidon-goldilocks** (`hashNoPad`) — Plonky2-compatible for circuit alignment |
| Backend | **Express** (TypeScript) with JWT auth |
| Database | **SQLite** (`credipro.sqlite`), **better-sqlite3** |
| Frontend | **React 18** (CRA + `react-app-rewired` for polyfills) |
| Wallet | **Lace Wallet** (Midnight testnet) |
| Logging | **Winston** (structured, file + console) |
| Container | **Docker Compose** (backend + frontend) |
| Testing | **Jest** + **Supertest** (54 tests, all passing) |

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Docker** (optional — for containerized deployment)
- **Lace Wallet** browser extension ([Chrome Web Store](https://chromewebstore.google.com)) — required for production mode
- **Compact CLI** (optional — for compiling contracts locally; pre-compiled artifacts included)

---

## Quick Start (Local Development)

```bash
# 1. Clone
git clone https://github.com/nova-rishabh/Credipro.git
cd Credipro

# 2. Install all dependencies (workspaces: backend + frontend)
npm install

# 3. Create .env from template
cp .env.example .env
# Edit .env: set JWT_SECRET and CREDIPRO_ENCRYPTION_KEY (or leave defaults for demo)

# 4. Compile Compact contract (or use pre-compiled artifacts)
npm run compile:contract

# 5. Build the backend
npm run build
```

### Run (Two Terminals)

```bash
# Terminal 1: Backend (port 3001)
npm run start:backend

# Terminal 2: Frontend (port 3000)
npm run start:frontend
```

### Or with Docker Compose

```bash
docker compose up --build
# Open http://localhost:3000
```

---

## Demo vs Production Mode

The app includes a **runtime toggle** in the header — no env var restarts needed.

| Mode | Wallet | Circuits | Env Vars Required |
|------|--------|----------|-------------------|
| **Demo** (default) | Mock wallet auto-connects | Mock circuit (Poseidon hash proofs) | None |
| **Production** | Lace Wallet | On-chain / compiled contract via Midnight SDK | `JWT_SECRET`, `CREDIPRO_ENCRYPTION_KEY`, `MIDNIGHT_CONTRACT_ADDRESS` |

Toggle via the pill button in the header (`Demo` ↔ `Production`). Switching to Production validates that all required env vars are set before activating.

---

## Running Tests

```bash
# All backend tests
npm test

# Integration tests (compiled contract required)
npm test:integration

# Test coverage
npm test:coverage

# Lint
npm run lint
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/token` | No | Issue JWT (body: `{ username }`) |
| `GET` | `/api/health` | No | Backend health, mode, contract status |
| `GET` | `/api/mode` | No | Current app mode (demo/production) |
| `PUT` | `/api/mode` | No | Switch mode (body: `{ mode }`) |
| `POST` | `/api/loan/request` | JWT | Request a loan |
| `POST` | `/api/loan/slash` | JWT | Trigger slashing |
| `GET` | `/api/loan/:id` | JWT | Get loan details |
| `GET` | `/api/pool/:address` | JWT | Get pool details |
| `POST` | `/api/oracle/vote` | JWT | Cast oracle vote |
| `GET` | `/api/oracle/members` | JWT | List oracle committee |
| `GET` | `/api/oracle/approvals/:loanId` | JWT | Get approval count |
| `POST` | `/api/oracle/auto-vote/:loanId` | JWT | Demo: auto-cast 2 votes |
| `POST` | `/api/oracle/clear/:loanId` | JWT | Demo: clear votes |
| `GET` | `/api/oracle/revealed-identity/:loanId` | JWT | Demo: reveal identity |
| `DELETE` | `/api/oracle/reset` | JWT | Demo: reset mock DB |

---

## Project Structure

```
Credipro/
├── backend/
│   ├── contracts/
│   │   ├── Credipro.compact              # Compact smart contract source
│   │   ├── contract/index.js             # Compiled contract (ESM)
│   │   ├── keys/                         # Prover & verifier keys
│   │   └── zkir/                         # ZK intermediate representation
│   ├── dist/contracts/                   # Compiled artifacts (CI)
│   ├── src/
│   │   ├── config/                       # env.ts, client.ts
│   │   ├── lib/                          # logger.ts, db.ts, appMode.ts
│   │   ├── middleware/                   # JWT auth middleware
│   │   ├── routes/                       # Express route handlers
│   │   ├── services/                     # contract.ts, prover.ts, oracle.ts, midnightClient.ts
│   │   ├── types/                        # TypeScript type definitions
│   │   └── __tests__/                    # Jest test suite (54 tests)
│   ├── scripts/                          # compile-contract.js, deploy.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/                   # React components
│   │   ├── context/                      # CrediproContext, ToastContext
│   │   ├── hooks/                        # useNotify
│   │   └── api/                          # crediproApi.ts (typed API client)
│   └── Dockerfile
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

---

## Hackathon MVP Scope

The following are **mocked** for the MVP and marked for production replacement:

| Mocked Component | Production Replacement |
|----------------|----------------------|
| **zkTLS oracle** (`mock_zkTLS_CreditScore`) | Real zkTLS via zkPass / Reclaim Protocol |
| **2-of-3 decryption** (plaintext oracle voting) | BLS threshold signature with N-party MPC |
| **Credit data in SQLite** | Real-time FICO / credit bureau API integration |
| **Passport identity** (dummy encrypted payload) | ePassport NFC chip reading + ICAO 9303 |
| **Poseidon mock proofs** (`generateMockProof`) | Actual `@midnight-ntwrk/compact-runtime` circuit execution |

### What Is Real

- ✅ Compact smart contract (`Credipro.compact`) — syntactically valid, structurally complete
- ✅ Compiled contract runtime integration (`contract/index.js`)
- ✅ Witness function layer with synchronous compact-runtime wrappers
- ✅ Full authentication pipeline (JWT issue, verify, expiry)
- ✅ Persistent SQLite storage (borrowers, identities, oracle votes)
- ✅ Winston structured logging
- ✅ BigInt/Uint8Array JSON serialization
- ✅ AbortController timeouts on frontend API calls
- ✅ Runtime demo/production mode toggle (no restart needed)
- ✅ Step-based ZK pipeline UI (witness generation → proof → broadcast → settlement)
- ✅ Oracle voting panel with consensus progress visualization
- ✅ 54 passing tests (unit + integration + API)

---

## Deploying to Midnight Testnet

See [`backend/scripts/deploy.ts`](./backend/scripts/deploy.ts) for a dry-validated deploy script.

```bash
$env:MIDNIGHT_RPC='https://your-testnet-rpc'
$env:MIDNIGHT_WALLET_SEED='your seed phrase'
$env:RUN_DEPLOY='true'
npx ts-node --esm backend/scripts/deploy.ts
```

---

## License

MIT
