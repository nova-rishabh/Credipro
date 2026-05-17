# Credipro Smart Contract Specification

**Project:** Credipro - Delegated Institutional Underwriting on Midnight Network
**Language:** Compact (Midnight's ZK-Native Smart Contract Language)
**Version:** 1.0.0 (MVP)
**Date:** May 16, 2026

---

## 1. Executive Summary

This document specifies the Credipro smart contract architecture built on the Midnight Network's Kachina protocol. The contract implements a **privacy-preserving decentralized lending platform** that solves the "Sybil default paradox" in uncollateralized Web3 lending by:

1. **Proving creditworthiness** via ZK proofs of off-chain credit data (without disclosing actual scores).
2. **Binding identity cryptographically** to loans (preventing Sybil attacks and default evasion).
3. **Selectively revealing identity** only to the affected underwriter upon default (with 2-of-3 oracle consensus).
4. **Enforcing legal recourse** via an off-chain Master Loan Agreement (MLA).

---

## 2. Architectural Overview

### 2.1 Three-Context Partition (Midnight's Kachina Protocol)

Credipro strictly adheres to Compact's enforced separation of concerns:

| Context | Role | Execution | Privacy |
|---------|------|-----------|---------|
| **Ledger Context** | Public on-chain state | On-chain, verifiable | Public (everyone reads) |
| **Witness Context** | Private local data | Off-chain, prover-side | Private (never leaves client) |
| **Circuit Context** | ZK proof logic | Prover-side → verifier | ZK (proof only, not data) |

#### Critical Constraint: Explicit Disclosure
- **No witness data can touch the ledger without an explicit `disclose()` call.**
- This enforces transparency: every data point revealed on-chain is intentional.
- Circuit parameters flowing to ledger operations must be prefixed with `disclose()`.

---

## 3. Ledger Context: Public On-Chain State

### 3.1 Core Ledger Fields

#### `liquidityPools: Map<Bytes<32>, Uint<64>>`
```compact
export ledger liquidityPools: Map<Bytes<32>, Uint<64>>;
```
**Purpose:** Tracks institutional liquidity pools and their aggregate TVL (Total Value Locked).

| Field | Type | Description |
|-------|------|-------------|
| Key | `Bytes<32>` | Pool address (underwriter identifier) |
| Value | `Uint<64>` | Total value locked in that pool (in smallest denomination) |

**Invariants:**
- Non-negative values only.
- Updated atomically during loan disbursement and repayment.

---

#### `publicRiskParameters: Map<Bytes<32>, PublicRiskParam>`
```compact
export struct PublicRiskParam {
  minCreditScore: Uint<0..850>,      // Min FICO equivalent (0-850)
  maxLTV: Uint<0..100>,              // Max loan-to-value ratio (0-100%)
  minMonthlyIncome: Uint<64>,        // Min monthly income threshold
}

export ledger publicRiskParameters: Map<Bytes<32>, PublicRiskParam>;
```
**Purpose:** Publicly defined underwriting thresholds set by institutional lenders.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `minCreditScore` | `Uint<0..850>` | 0–850 | Minimum FICO score equivalent (validated in `requestLoan` circuit) |
| `maxLTV` | `Uint<0..100>` | 0–100% | Max loan-to-value ratio (validated in `requestLoan` circuit) |
| `minMonthlyIncome` | `Uint<64>` | 0–2^64−1 | Min verified monthly income (reserved for future validation) |

**Access Pattern:**
- Underwriters call an off-chain governance function to set these parameters.
- Borrowers' circuits read these parameters to validate their creditworthiness.

---

#### `encryptedIdentityCommitments: Map<Bytes<32>, LoanIdentityRecord>`
```compact
export struct LoanIdentityRecord {
  identityHash: Bytes<32>,           // Hash of passport + name (witness-kept)
  loanId: Bytes<32>,                 // Unique loan identifier
  lenderAddress: Bytes<32>,          // Underwriter's address
  disbursedAmount: Uint<64>,         // Original loan amount
  disbursalTimestamp: Uint<64>,      // Unix timestamp of disbursement
  defaultThreshold: Uint<64>,        // Days until default occurs
  isDefaulted: Boolean,              // Flag: has loan been marked defaulted?
}

export ledger encryptedIdentityCommitments: Map<Bytes<32>, LoanIdentityRecord>;
```
**Purpose:** Hashed identity commitments bound to active loans (prevents Sybil attacks).

| Field | Type | Description |
|-------|------|-------------|
| Key | `Bytes<32>` | Loan ID (deterministic hash of identity + lender + amount) |
| `identityHash` | `Bytes<32>` | **Hashed** commitment of borrower's identity (actual identity **never** disclosed on-chain) |
| `loanId` | `Bytes<32>` | Unique loan identifier for reference |
| `lenderAddress` | `Bytes<32>` | Address of the underwriter who originated the loan |
| `disbursedAmount` | `Uint<64>` | Original loan amount (disclosed for accounting) |
| `disbursalTimestamp` | `Uint<64>` | Unix timestamp when funds were transferred |
| `defaultThreshold` | `Uint<64>` | Days from disbursement to default (e.g., 180 days) |
| `isDefaulted` | `Boolean` | Flag: has the loan been marked as defaulted? |

**Zero-Knowledge Property:**
- The `identityHash` is a Poseidon hash of the borrower's encrypted passport data.
- The actual passport data (name, ID, biometric) **never** appears on-chain.
- Only upon default (with oracle consensus) is the identity decrypted off-chain.

---

#### `oracleCommitteeSignatures: Map<Bytes<32>, Uint<0..3>>`
```compact
export ledger oracleCommitteeSignatures: Map<Bytes<32>, Uint<0..3>>;
```
**Purpose:** Tracks 2-of-3 oracle committee approvals for default resolutions.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| Key | `Bytes<32>` | – | Loan ID |
| Value | `Uint<0..3>` | 0–3 | Approval count from oracle committee members (0 = no approval, 3 = full consensus) |

**Flow:**
1. When a loan is flagged as potentially defaulted, the oracle committee votes.
2. Each oracle call increments this counter.
3. Threshold: **2 of 3** approvals required to trigger slashing.

---

### 3.2 Kachina Ledger Guarantees

- **Atomicity:** All ledger writes within a circuit execute atomically or fail entirely.
- **Immutability:** Once written, historical ledger state is audit-able.
- **Consistency:** The ledger is the single source of truth; witness data is local-only.

---

## 4. Witness Context: Private Local Execution

Witnesses are **declarations only** (no implementation in Compact). The actual implementation lives in the TypeScript prover.

### 4.1 Core Witness Functions

#### `mock_zkTLS_CreditScore(): Uint<0..850>`
```compact
witness mock_zkTLS_CreditScore(): Uint<0..850>;
```
**Purpose:** Retrieves the borrower's off-chain credit score (mocked for MVP).

**Semantics:**
- In production: Invokes a zkTLS oracle (e.g., zkPass, Reclaim Protocol) to cryptographically prove the borrower's FICO score without revealing the score itself.
- For hackathon MVP: Returns a locally stored mock credit score.
- **Privacy:** The actual score is **never** disclosed on-chain. Only a ZK proof that it meets the minimum is recorded.

**Prover Implementation (TypeScript):**
```typescript
witness mock_zkTLS_CreditScore(): number {
  // Read from local mock credit bureau or zkTLS oracle
  return borrower.mockCreditScore;  // e.g., 720
}
```

---

#### `read_Identity_NFC(): Opaque<"Uint8Array">`
```compact
witness read_Identity_NFC(): Opaque<"Uint8Array">;
```
**Purpose:** Reads encrypted passport/identity data from local NFC or secure storage.

**Semantics:**
- Returns opaque encrypted bytes (the circuit cannot inspect the content).
- In production: Reads from an NFC passport chip.
- For hackathon MVP: Reads from local encrypted storage.
- **Privacy:** The circuit receives an opaque handle; actual data remains inaccessible.

**Prover Implementation (TypeScript):**
```typescript
witness read_Identity_NFC(): Uint8Array {
  // Simulate reading from NFC or encrypted local storage
  return borrower.encryptedPassport;  // Bytes, not readable by circuit
}
```

---

#### `compute_identity_hash(passport_data: Opaque<"Uint8Array">): Bytes<32>`
```compact
witness compute_identity_hash(passport_data: Opaque<"Uint8Array">): Bytes<32>;
```
**Purpose:** Derives a deterministic identity commitment hash locally (off-chain).

**Semantics:**
- Takes the opaque passport data and produces a Poseidon hash.
- The hash is **disclosed** on-chain (bound to the loan).
- The actual passport data remains strictly off-chain.

**Prover Implementation (TypeScript):**
```typescript
witness compute_identity_hash(passportData: Uint8Array): Bytes<32> {
  // Hash using Poseidon (same as circuit's persistentHash)
  return poseidonHash([passportData]);
}
```

---

#### `local_secret_key(): Bytes<32>`
```compact
witness local_secret_key(): Bytes<32>;
```
**Purpose:** Retrieves the borrower's locally-held secret key for signing transactions.

**Semantics:**
- Used to derive the public key via `derive_public_key()` circuit.
- **Never** disclosed on-chain.

---

#### `get_lender_address(): Bytes<32>`
```compact
witness get_lender_address(): Bytes<32>;
```
**Purpose:** Retrieves the underwriter's address for the current loan request.

**Semantics:**
- Identifies which institutional lender originated the loan.
- Deterministically incorporated into the loan ID hash.

---

#### `get_loan_details(): LoanIdentityRecord`
```compact
witness get_loan_details(): LoanIdentityRecord;
```
**Purpose:** Retrieves stored loan details locally (for updates during slashing).

---

#### `check_default_deadline_exceeded(): Boolean`
```compact
witness check_default_deadline_exceeded(): Boolean;
```
**Purpose:** Verifies that the current timestamp exceeds the default deadline.

**Semantics:**
- Called during slashing to confirm the loan is past due.
- Returns `true` if `now > disbursalTimestamp + defaultThreshold`.

**Prover Implementation (TypeScript):**
```typescript
witness check_default_deadline_exceeded(): boolean {
  const now = Date.now() / 1000;  // Unix timestamp
  const deadline = loanRecord.disbursalTimestamp + loanRecord.defaultThreshold;
  return now > deadline;
}
```

---

### 4.2 Witness Lifecycle

1. **Declaration:** Declared in Compact with signature only, no body.
2. **Implementation:** Implemented in TypeScript prover (off-chain).
3. **Invocation:** Circuit calls witness; prover provides the value.
4. **Constraint:** Value is used in circuit logic (e.g., assertions, comparisons).

---

## 5. Circuit Context: ZK Proof Logic

### 5.1 Main Circuits

---

#### Circuit 1: `requestLoan(loanAmount, poolAddress, defaultTermDays) → loanId`

```compact
export circuit requestLoan(
  loanAmount: Uint<64>,
  poolAddress: Bytes<32>,
  defaultTermDays: Uint<64>
): Bytes<32>
```

**Purpose:**
Generate a zero-knowledge proof that the borrower's off-chain credit data satisfies the lender's public risk parameters, **without exposing the actual credit score, income, or identity**.

**High-Level Flow:**
1. Retrieve private witness data (credit score, identity, lender address).
2. Fetch public risk parameters from ledger.
3. Assert credit score ≥ minimum (privately).
4. Assert loan amount ≤ pool TVL (LTV check).
5. Compute identity commitment hash.
6. Create loan record on ledger.
7. Return loan ID.

**Detailed Logic:**

```
Step 1: Retrieve Witness Context
├─ creditScore ← mock_zkTLS_CreditScore()  [Uint<0..850>]
├─ passport ← read_Identity_NFC()  [Opaque<"Uint8Array">]
├─ identityHash ← compute_identity_hash(passport)  [Bytes<32>]
└─ lenderAddr ← get_lender_address()  [Bytes<32>]

Step 2: Fetch Public Risk Parameters
├─ riskParams ← publicRiskParameters.lookup(poolAddress)
└─ assert(publicRiskParameters.member(poolAddress))

Step 3: Assert Credit Score Threshold
└─ assert(disclose(creditScore >= riskParams.minCreditScore))

Step 4: Assert Loan Amount ≤ Pool TVL
├─ poolTVL ← liquidityPools.lookup(poolAddress)
└─ assert(disclose(loanAmount <= poolTVL))

Step 5: Compute Loan ID
└─ loanId ← persistentHash([identityHash, lenderAddr, loanAmount])

Step 6: Create Loan Record
└─ encryptedIdentityCommitments.insert(loanId, {
   identityHash, loanId, lenderAddress, disbursedAmount,
   disbursalTimestamp: 0, defaultThreshold, isDefaulted: false
})

Step 7: Return Loan ID
└─ return disclose(loanId)
```

**Zero-Knowledge Properties:**
- ✅ Verifier learns: Loan was approved for a specific amount by a specific lender.
- ✅ Verifier learns: An identity commitment exists (cannot be replayed).
- ❌ Verifier does NOT learn: Actual credit score, income, real identity, passport data.
- ❌ Verifier does NOT learn: What lender set which parameters.

**Key Assertions with `disclose()`:**
```compact
// Credit score comparison (witness value → ledger decision)
assert(disclose(creditScore >= riskParams.minCreditScore), "...");

// Loan amount validation (circuit param → ledger decision)
assert(disclose(loanAmount <= poolTVL), "...");
```

**Critical Design Decisions:**
1. **No raw credit score on-chain:** Only a hash of the identity + a proof of creditworthiness.
2. **Identity committed, not revealed:** `identityHash` is stored; actual data remains off-chain.
3. **Loan ID deterministic:** Prevents borrower from generating multiple loan IDs for the same identity.

---

#### Circuit 2: `triggerSlashing(loanId) → ()`

```compact
export circuit triggerSlashing(loanId: Bytes<32>): []
```

**Purpose:**
Prove that a loan meets the conditions for default resolution (deadline exceeded + 2-of-3 oracle consensus), then mark it as defaulted on-chain. This circuit acts as the **enforcement trigger** for identity reveal.

**High-Level Flow:**
1. Retrieve loan record by ID.
2. Verify loan is not already defaulted.
3. Assert default deadline exceeded (via witness).
4. Retrieve oracle approval count.
5. Assert 2-of-3 threshold met.
6. Mark loan as defaulted.
7. Trigger identity reveal (off-chain action).

**Detailed Logic:**

```
Step 1: Retrieve Loan Record
├─ assert(encryptedIdentityCommitments.member(loanId))
└─ loanRecord ← encryptedIdentityCommitments.lookup(loanId)

Step 2: Verify Not Already Defaulted
└─ assert(disclose(!loanRecord.isDefaulted))

Step 3: Assert Default Deadline Exceeded
├─ defaultThresholdExceeded ← check_default_deadline_exceeded()
└─ assert(disclose(defaultThresholdExceeded))

Step 4: Retrieve Oracle Approvals
├─ assert(oracleCommitteeSignatures.member(loanId))
└─ oracleApprovals ← oracleCommitteeSignatures.lookup(loanId)

Step 5: Assert 2-of-3 Threshold
└─ assert(disclose(oracleApprovals >= 2))

Step 6: Mark as Defaulted
├─ loanRecord.isDefaulted ← true
└─ encryptedIdentityCommitments.insert(loanId, loanRecord)

Step 7: Trigger Identity Reveal
└─ [Off-chain Oracle Committee Action]
   - Decrypt identityHash using lender's public key
   - Retrieve borrower's real identity from passport
   - Send encrypted identity to lender
   - Lender verifies MLA and pursues legal collections
```

**Zero-Knowledge Properties:**
- ✅ Circuit proves: Deadline was exceeded AND oracle consensus was reached.
- ✅ Circuit proves: Loan record exists and matches the ID.
- ❌ Circuit does NOT reveal: Which identity is being revealed (done off-chain by oracle).
- ❌ Circuit does NOT reveal: Identity data to the ledger (remains encrypted until decryption).

**Decryption (Off-Chain Oracle Action):**
The circuit does **not** perform decryption (circuits are deterministic). Instead:
1. Oracle committee confirms slashing conditions are met (via circuit proof).
2. Oracle committee holds the decryption key or performs MPC threshold decryption.
3. Decrypted identity is sent to the affected lender via encrypted channel.
4. Lender verifies the Master Loan Agreement (off-chain) and pursues legal recourse.

---

### 5.2 Helper Circuits

#### Pure Circuit: `derive_public_key(secret_key) → public_key`

```compact
pure circuit derive_public_key(secret_key: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "credipro:pk:"),
    secret_key
  ]);
}
```

**Purpose:** Derive the borrower's public key from their secret key.

**Note:** `public_key()` is **not** a Compact builtin. This pattern (persistentHash) is the standard way to derive keys.

---

#### Circuit: `verify_master_loan_agreement(borrower_pk, mla_hash, signature) → ()`

```compact
export circuit verify_master_loan_agreement(
  borrower_pk: Bytes<32>,
  mla_hash: Bytes<32>,
  signature: Opaque<"Uint8Array">
): []
```

**Purpose:** Assert that the borrower has signed the Master Loan Agreement (off-chain legal contract).

**Implementation:**
```compact
let sig_valid = verify_mla_signature(borrower_pk, mla_hash, signature);
assert(disclose(sig_valid), "Master Loan Agreement signature invalid");
```

**Note:** Signature verification is **off-chain** (done by the prover). The circuit receives a boolean witness (`verify_mla_signature`) indicating whether the signature is valid.

---

## 6. Data Types

### 6.1 Enumerations (Future)

```compact
export enum LoanStatus { pending, approved, active, defaulted, repaid }
export enum OracleDecision { approve, reject, inconclusive }
```

### 6.2 Custom Structs

Already defined in Ledger Context:
- `PublicRiskParam`
- `LoanIdentityRecord`

---

## 7. Consensus Rules & Invariants

### 7.1 Loan Record Invariants

**For any `loanId` in `encryptedIdentityCommitments`:**

```
✓ identityHash ≠ empty (prevents phantom loans)
✓ disbursedAmount > 0 (no zero loans)
✓ defaultThreshold > 0 (valid term)
✓ lenderAddress ≠ empty (valid underwriter)
✓ isDefaulted ∈ {false, true} (boolean consistency)
```

### 7.2 Oracle Committee Invariants

**For any `loanId` in `oracleCommitteeSignatures`:**

```
✓ approval_count ∈ [0, 3] (at most 3 signatories)
✓ approval_count ≥ 2 to trigger slashing (consensus required)
✓ Once defaulted, approval_count is immutable
```

### 7.3 Credit Score Invariants

**In every call to `requestLoan`:**

```
✓ creditScore ≥ publicRiskParameters[poolAddress].minCreditScore
✓ loanAmount ≤ liquidityPools[poolAddress]  [LTV check]
✓ loanAmount > 0 (non-zero loans only)
```

---

## 8. Security Considerations

### 8.1 Sybil Attack Prevention

**Threat:** Attacker generates multiple DIDs and obtains multiple loans, then defaults on all.

**Mitigation:**
- Identity is **cryptographically bound** to the loan via `identityHash`.
- The hash is derived from the borrower's passport + name (unique off-chain data).
- Upon default, the identity **can be revealed** (with oracle consensus + MLA).
- Real-world legal action becomes possible, creating deterrent.

### 8.2 Privacy Preservation

**Threat:** Lender's proprietary risk parameters leak to competitors.

**Mitigation:**
- `publicRiskParameters` are **intentionally public** (set by underwriter).
- The underwriter controls what parameters are exposed.
- Private parameters (e.g., portfolio composition) are **not** on-chain.

### 8.3 Oracle Centralization Risk

**Threat:** 2-of-3 oracle committee could be compromised or collude.

**Mitigation:**
- The circuit **proves** conditions are met (deadline + approvals).
- Identity reveal happens off-chain; oracle cannot forge proofs.
- Master Loan Agreement provides legal recourse against rogue oracles.
- Future versions: True N-party MPC threshold decryption.

### 8.4 Master Loan Agreement (MLA)

**Purpose:** Provides **legal jurisdiction** and **governance** for off-chain enforcement.

**Required Fields:**
- Jurisdiction (legal location for collections)
- Data points to reveal (name, ID, SSN, etc.)
- Lender's identity (for receiving decrypted data)
- Borrower's signature (off-chain verification)

**Signed During:** Onboarding (before `requestLoan` is called).

**Role in Slashing:**
1. Circuit proves default conditions are met.
2. Oracle decrypts identity off-chain.
3. Lender verifies MLA signature and jurisdiction.
4. Lender initiates legal collections.

---

## 9. Deployment & Initialization

### 9.1 Contract Deployment

```typescript
// Pseudo-TypeScript (midnight-js SDK)
const contract = await deployContract('Credipro', {
  liquidityPools: new Map(),
  publicRiskParameters: new Map(),
  encryptedIdentityCommitments: new Map(),
  oracleCommitteeSignatures: new Map(),
});
```

### 9.2 Underwriter Pool Setup

```typescript
// Underwriter sets their risk parameters
const poolAddr = "0x...";
const riskParams = {
  minCreditScore: 680,      // FICO equivalent
  maxLTV: 80,               // 80% max LTV
  minMonthlyIncome: 5000,   // in smallest denomination
};

contract.publicRiskParameters.insert(poolAddr, riskParams);
contract.liquidityPools.insert(poolAddr, 1000000);  // 1M in TVL
```

### 9.3 Borrower Onboarding

```typescript
// 1. Borrower signs Master Loan Agreement (off-chain)
const mla = await borrower.signMLA({
  jurisdiction: "NYC, NY",
  lenderAddress: poolAddr,
});

// 2. Borrower's local prover stores encrypted identity
borrower.storeEncryptedPassport({
  name: "Alice Smith",
  passportId: "AB123456",
  dob: "1990-01-15",
  encrypted: true,
});

// 3. Borrower's local mock credit score (or zkTLS oracle)
borrower.setCreditScore(720);
```

---

## 10. Testing & Validation

### 10.1 Unit Test Cases

#### Test 1: requestLoan succeeds when credit score meets threshold
```
Given: creditScore = 720, minCreditScore = 680
When: Call requestLoan(...)
Then: Circuit succeeds, returns valid loanId
```

#### Test 2: requestLoan fails when credit score is below threshold
```
Given: creditScore = 650, minCreditScore = 680
When: Call requestLoan(...)
Then: Circuit fails with "Credit score below minimum threshold"
```

#### Test 3: triggerSlashing succeeds when all conditions met
```
Given: 
  - Loan exists and isDefaulted = false
  - Deadline exceeded = true
  - Oracle approvals ≥ 2
When: Call triggerSlashing(loanId)
Then: loanRecord.isDefaulted = true
```

#### Test 4: triggerSlashing fails if deadline not exceeded
```
Given:
  - Loan exists
  - Deadline exceeded = false
When: Call triggerSlashing(loanId)
Then: Circuit fails with "Default deadline has not yet been exceeded"
```

---

## 11. Future Enhancements

### 11.1 Phase 2: Multi-Party Computation (MPC)

Replace the 2-of-3 oracle committee with true N-party threshold decryption:
- Use BLS threshold signatures to decrypt identity.
- No single oracle has the decryption key.
- More robust against collusion.

### 11.2 Phase 2: Real zkTLS Integration

Replace mock credit score with real zkTLS oracles:
- Integrate with zkPass or Reclaim Protocol.
- Fetch real FICO scores and income verification.
- Support multiple identity verification services.

### 11.3 Phase 3: Cross-Chain Bridging

Extend Credipro to Ethereum, Polygon, and other chains:
- Use Midnight as the privacy layer.
- Bridge loan issuance to public chains.
- Maintain privacy while settling via public ledgers.

### 11.4 Phase 3: Secondary Market

Enable loan trading:
- Lenders sell loans to other institutions.
- Privacy-preserving loan bundling.
- Securitization of loan pools.

---

## 12. Operational Runbook

### 12.1 Borrower Loan Request Flow

```
1. Borrower connects Lace Wallet extension.
2. Borrower signs Master Loan Agreement (jurisdiction, lender, terms).
3. Borrower mocks-authenticate with credit bureau (zkTLS, or mock).
4. Borrower scans NFC passport (or simulates via mock data).
5. Borrower's local prover generates ZK proof of creditworthiness.
6. Borrower calls contract.requestLoan(loanAmount, poolAddress, termDays).
7. Smart contract verifies proof and records loan ID.
8. Lender off-chain receives loan ID and disburses funds via Zswap.
```

### 12.2 Default Resolution Flow

```
1. Loan term expires (defaultThreshold days pass).
2. Any participant calls contract.triggerSlashing(loanId).
3. Circuit verifies deadline exceeded.
4. Oracle committee votes to approve (≥ 2 of 3).
5. Oracle committee decrypts identity off-chain.
6. Lender receives decrypted identity (name, ID, etc.).
7. Lender verifies Master Loan Agreement and jurisdiction.
8. Lender initiates real-world legal collections.
```

---

## 13. References & Appendices

### 13.1 Related Documentation

- **PRD:** Product Requirements Document (`/Docs/PRD.md`)
- **TRD:** Technical Requirements Document (`/Docs/TRD.md`)
- **Schema:** Backend & Smart Contract Schema (`/Docs/Backend & Smart Contract Schem.md`)
- **Foundational Context:** (`/Docs/Foundational Context.md`)

### 13.2 Compact Language Reference

- **Official Docs:** https://docs.midnight.network/develop/reference/compact/lang-ref
- **Standard Library:** `CompactStandardLibrary` (imported automatically)
- **Builtin Functions:**
  - `persistentHash<T>(value: T): Bytes<32>` — Poseidon hash
  - `persistentCommit<T>(value: T): Bytes<32>` — Hiding commitment
  - `disclose(value: T): T` — Explicit disclosure annotation
  - `assert(condition: Boolean, message?: string): []` — Assertion
  - `pad(length: number, value: string): Bytes<N>` — Padding

### 13.3 Key Concepts

| Term | Definition |
|------|-----------|
| **Kachina** | Midnight's state bifurcation protocol (ledger + witness + circuit) |
| **Witness** | Private, off-chain data provided by the prover to the circuit |
| **Circuit** | On-chain function that generates a ZK proof |
| **Ledger** | Public, on-chain state (all participants can read) |
| **disclose()** | Explicit annotation marking witness data as visible on-chain |
| **zk-SNARK** | Zero-knowledge Succinct Non-interactive Argument of Knowledge |
| **MLA** | Master Loan Agreement (off-chain legal contract) |
| **Oracle Committee** | 2-of-3 trusted signatories for approving default resolutions |
| **Sybil Attack** | Creating multiple fake identities to evade default responsibility |

---

## 14. Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-05-16 | Midnight MCP | Initial specification; MVP scope |

---

**Document Status:** ✅ READY FOR REVIEW & DEVELOPMENT
