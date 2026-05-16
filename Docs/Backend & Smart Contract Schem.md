# Backend & Smart Contract Schema

[cite_start]Because Midnight uses the Compact language, the architecture is strictly partitioned into three contexts[cite: 47, 194].

## 1. Ledger Context (Public On-Chain State)
* [cite_start]`LiquidityPools`: Array tracking the aggregate TVL of institutional pools[cite: 48].
* [cite_start]`PublicRiskParameters`: Publicly defined thresholds set by underwriters[cite: 49].
* [cite_start]`EncryptedIdentityCommitments`: The hashed commitments of user identities bound to active loans[cite: 49].
* `OracleCommitteeSignatures`: Tracks the approvals of the 2-of-3 oracle multi-sig for default resolutions.

## 2. Witness Context (Private Local Execution)
* [cite_start]`mock_zkTLS_CreditScore()`: Local function to read and format the strictly structured mock credit data[cite: 50].
* [cite_start]`read_Identity_NFC()`: Local function to read the encrypted passport data[cite: 51].

## 3. Circuit Context (ZK Prover)
* [cite_start]`circuit requestLoan()`: Asserts that the data from the Witness Context satisfies the `PublicRiskParameters`[cite: 52]. [cite_start]Generates the zk-SNARK without exposing the raw numbers[cite: 53].
* [cite_start]`circuit triggerSlashing()`: Executes the identity reveal logic strictly *if* the default timeframe is exceeded AND the 2-of-3 oracle committee threshold is met[cite: 54].