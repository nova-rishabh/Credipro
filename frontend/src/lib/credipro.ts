import { requestLoan as apiRequestLoan } from '../api/crediproApi';

export type Bytes32 = string & { readonly __bytes32: true };

export function toBytes32(hex: string): Bytes32 {
  if (!hex.startsWith('0x')) {
    hex = '0x' + hex;
  }
  if (hex.length !== 66) {
    throw new Error(`Invalid Bytes32: expected 66 chars, got ${hex.length}`);
  }
  return hex as Bytes32;
}

export class CrediproClient {
  constructor(
    private contractAddress: Bytes32,
    private wallet: any,
  ) {
    console.log('[CrediproClient] initialized at', contractAddress);
  }

  async requestLoan(
    loanAmount: bigint,
    poolAddress: Bytes32,
    defaultTermDays: bigint,
  ): Promise<{ success: boolean; loanId?: string; error?: string }> {
    return apiRequestLoan(Number(loanAmount), poolAddress, Number(defaultTermDays));
  }
}
