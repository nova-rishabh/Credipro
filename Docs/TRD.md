# Technical Requirements Document (TRD)

* **Smart Contract Language:** Compact. [cite_start]This is Midnight's strongly typed, TypeScript-inspired domain-specific language that abstracts zero-knowledge complexity and enforces explicit data disclosure[cite: 27, 194].
* **State Management:** The Kachina protocol. [cite_start]This bifurcates state into a Public Ledger State (for aggregate balances and cryptographic commitments via ParityDB) and a Private Local State (for sensitive user data residing strictly on the client's local machine)[cite: 28, 188, 190].
* **AI Coding Integration:** Midnight MCP (Model Context Protocol) Server. [cite_start]This allows Claude Code to directly interface with Midnight's ecosystem[cite: 99, 303].
* [cite_start]**Zero-Knowledge Prover:** BLS12-381 elliptic curve for highly efficient zk-SNARK proof generation[cite: 29, 196].
* [cite_start]**Frontend Architecture:** React or Next.js utilizing the `@midnight-ntwrk/compact-js` SDK[cite: 32, 248]. *(Note: Verify the latest package namespace on npm prior to `npm install`, as Midnight SDK nomenclature shifts rapidly across preview releases).*