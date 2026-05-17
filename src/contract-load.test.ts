import { Contract, ledger, pureCircuits, Witnesses } from '../dist/contracts/contract';

describe('Compiled Compact Contract Loading Verification', () => {
  it('should successfully import and instantiate the compiled Credipro contract', () => {
    // Define dummy witnesses matching the generated Witnesses interface
    const dummyWitnesses: Witnesses<any> = {
      mock_zkTLS_CreditScore: (context) => [context.privateState, 750n],
      read_Identity_NFC: (context) => [context.privateState, new Uint8Array(32)],
      compute_identity_hash: (context, _passport) => [context.privateState, new Uint8Array(32)],
      get_lender_address: (context) => [context.privateState, new Uint8Array(32)],
      check_default_deadline_exceeded: (context) => [context.privateState, false],
      verify_mla_signature: (context, _pk, _hash, _sig) => [context.privateState, true],
    };

    // Instantiate the contract
    const contract = new Contract(dummyWitnesses);

    // Verify contract properties and circuits exist
    expect(contract).toBeDefined();
    expect(contract.witnesses).toBe(dummyWitnesses);
    expect(contract.circuits).toBeDefined();
    expect(contract.circuits.requestLoan).toBeDefined();
    expect(contract.circuits.triggerSlashing).toBeDefined();
    expect(contract.circuits.verify_master_loan_agreement).toBeDefined();

    // Verify ledger and pureCircuits exports exist
    expect(ledger).toBeDefined();
    expect(pureCircuits).toBeDefined();
  });
});
