declare module 'credipro' {
  export function toBytes32(value: string): string;
  export class CrediproClient {
    requestLoan(loanAmount: bigint, poolAddress: string, defaultTermDays: bigint): Promise<{
      success: boolean;
      loanId: string | null;
      error: string | null;
    }>;
  }
}
