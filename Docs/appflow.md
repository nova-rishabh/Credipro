# App Flow

1.  [cite_start]**Onboarding:** The borrower connects their Lace Wallet extension[cite: 33]. They digitally sign an off-chain Master Loan Agreement specifying legal jurisdiction in the event of default.
2.  [cite_start]**Identity & Credit Generation (Off-Chain):** The borrower uses the Credipro UI to mock-authenticate with a traditional credit bureau via our simulated zkTLS extension[cite: 34]. [cite_start]They scan a simulated NFC passport chip[cite: 35].
3.  [cite_start]**Proof Generation:** The user's local machine acts as a Witness Context, formatting the local credit data[cite: 36, 195]. [cite_start]The local function generates a zk-SNARK attesting they meet specific risk thresholds[cite: 36].
4.  [cite_start]**Loan Application:** The borrower submits the ZK credentials to the Midnight network[cite: 37].
5.  [cite_start]**Underwriting Match:** The Compact smart contract evaluates the private inputs against the public risk parameters set by the institutional pools[cite: 38, 145].
6.  [cite_start]**Disbursement:** If matched, the loan is authorized and funds are transferred privately using Zswap nullifiers[cite: 39].
7.  [cite_start]**Resolution (Success):** If the loan is repaid, the user builds a private on-chain credit history[cite: 40].
8.  [cite_start]**Resolution (Default):** If the user defaults, the contract pings the 2-of-3 Trusted Oracle Committee[cite: 41]. Upon threshold consensus, the decryption logic fires, revealing the user's identity to the underwriter for real-world legal action.