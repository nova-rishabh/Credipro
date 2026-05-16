# Product Requirements Document (PRD)

* **Product Name:** Credipro
* [cite_start]**Objective:** Build a decentralized marketplace connecting institutional underwriters with retail borrowers via a "Delegated Institutional Underwriting" model, utilizing Midnight's selective disclosure primitives[cite: 22, 140].

## Core Mechanics
* [cite_start]**zkTLS Integration (MVP Fallback):** Users utilize zkTLS protocols to generate cryptographic proofs of their off-chain traditional FICO scores and income[cite: 23]. *Hackathon Scope:* Because deep integration with providers like zkPass or Reclaim carries significant risk in a 48-hour window, the MVP will utilize a local mock of the zkTLS oracle response, strictly defining the data structure to prove the concept without getting blocked by third-party APIs.
* [cite_start]**Identity Binding:** To prevent Sybil attacks, users generate a zero-knowledge proof of uniqueness bound to a government identity, without ever revealing their actual name or document number to the blockchain[cite: 24, 143].
* [cite_start]**Algorithmic Underwriting:** Institutional underwriters manage custom liquidity pools on the Midnight network and set algorithmic, public risk parameters[cite: 25, 144].
* [cite_start]**MPC Slashing Mechanism (MVP Scope):** A cryptographic slashing mechanism selectively reveals a defaulting borrower's identity strictly to the affected underwriter[cite: 26, 147]. *Hackathon Scope:* Implementing a true N-party MPC threshold decryption scheme is impossible in 48 hours. The MVP will substitute this with a "2-of-3 Trusted Oracle Committee" multi-sig trigger to simulate the threshold consensus required to unmask the identity.