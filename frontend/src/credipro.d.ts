declare module 'credipro' {
  export type Bytes32 = string & { readonly __bytes32: true };
  export function toBytes32(hex: string): Bytes32;

  export class CrediproClient {
    constructor(contractAddress: Bytes32, wallet: any);
    requestLoan(
      loanAmount: bigint,
      poolAddress: Bytes32,
      defaultTermDays: bigint,
    ): Promise<{ success: boolean; loanId?: string; error?: string }>;
  }
}
