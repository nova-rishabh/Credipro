# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Credipro is a privacy-preserving decentralized lending protocol on the Midnight Network. It enables borrowers to prove creditworthiness using ZK proofs via the Kachina protocol and Compact smart contracts, allowing for undercollateralized loans with selective identity reveal upon default.

## Commands

### General Development
- Install dependencies: `npm install`
- Build backend: `npm run build`
- Start backend (dev): `npm run start:backend`
- Start frontend (dev): `npm run start:frontend`
- Run both backend & frontend: `npm run dev:all`
- Docker Compose: `docker compose up --build`
- Compile Compact contracts: `npm run compile:contract`

### Testing & Quality
- Run unit tests: `npm test`
- Run integration tests: `npm test:integration`
- Test coverage: `npm test:coverage`
- Lint backend: `npm run lint`
- Format backend: `npm run format`

## Architecture

### High-Level Structure
- **Frontend**: React SPA (port 3000) using `react-app-rewired` for Midnight SDK compatibility.
- **Backend**: Express API (TypeScript, port 3001) with SQLite persistence (`credipro.sqlite`) and JWT authentication.
- **Contracts**: Written in Compact (Midnight's ZK language), implementing two primary circuits: `requestLoan` (underwriting) and `triggerSlashing` (default resolution).

### ZK Proof Flow
1. **Client-Side**: Borrower generates a ZK proof locally that their credit score meets the required threshold.
2. **Submission**: Proof is submitted to the `requestLoan` circuit.
3. **On-Chain Verification**: The contract verifies the proof and creates an encrypted identity commitment on the ledger.
4. **Default Handling**: Upon default, a 2-of-3 oracle committee must reach consensus via `triggerSlashing` to reveal the identity to the affected underwriter.

### Key Cryptography & Security
- **Hashing**: Uses `poseidon-goldilocks` (`hashNoPad`) for ZK-circuit compatibility.
- **Identity**: Raw identity is kept off-chain; only hashed commitments are stored on-chain.
- **Authentication**: Strict JWT verification for all protected API routes via `JWT_SECRET`.
- **Oracle Consensus**: Identity reveal requires $\ge 2$ of 3 oracle votes.

## Project Structure
```
Credipro/
├── backend/             # Express API + Midnight SDK
│   ├── src/
│   │   ├── config/      # Environment & Client setup
│   │   ├── lib/         # Database (SQLite) & Logger (Winston)
│   │   ├── middleware/   # JWT Authentication
│   │   ├── routes/      # API Endpoints
│   │   ├── services/    # Contract, Oracle, and Prover logic
│   │   └── types/       # TypeScript definitions
├── frontend/            # React SPA
├── contracts/           # Compact Smart Contracts (Credipro.compact)
├── docs/                # Technical Specs (PRD, TRD, Contract Spec)
└── docker-compose.yml   # Full stack orchestration
```

## Important Constraints
- **Privacy First**: Never store raw credit scores, biometric data, or unhashed identities on-chain or in logs.
- **Zk-Circuit Alignment**: Use `poseidon-goldilocks` for any hashing or data commitment to ensure compatibility with Compact circuits.
- **Oracle Consensus**: Adhere strictly to the 2-of-3 oracle vote requirement for identity reveal.
