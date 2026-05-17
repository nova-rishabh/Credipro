import * as api from '../api/crediproApi';

export function toBytes32(value: string) {
  if (value.startsWith('0x') && value.length === 66) return value;
  return '0x' + value.padStart(64, '0');
}

export class CrediproClient {
  async requestLoan(loanAmount: bigint, poolAddress: string, defaultTermDays: bigint) {
    const result = await api.requestLoan(
      Number(loanAmount),
      poolAddress,
      Number(defaultTermDays),
    );
    return {
      success: result.success,
      loanId: result.loanId ?? null,
      error: result.error ?? null,
    };
  }
}
