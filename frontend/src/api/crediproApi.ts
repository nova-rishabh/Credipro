/**
 * Credipro API Service Layer
 * Typed API client for communicating with the Express backend
 */

const API_BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'mvp-demo-token';

/**
 * Generic fetch wrapper with auth headers and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse JSON response - backend returns structured errors even on non-200
    const data = await response.json();

    // Return data even on non-200 (backend returns structured error body)
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    }
    throw new Error('API request failed: Unknown error');
  }
}

// ============================================
// Type Definitions
// ============================================

export interface LoanRequestResponse {
  success: boolean;
  loanId?: string;
  error?: string;
  proof?: string;
}

export interface LoanDetails {
  loanId: string;
  identityHash: string;
  lenderAddress: string;
  borrowerPublicKey: string;
  disbursedAmount: string;
  disbursalTimestamp: number;
  defaultThreshold: string;
  isDefaulted: boolean;
  interestRate: number;
}

export interface OracleMember {
  name: string;
  publicKey: string;
}

export interface OracleMembersResponse {
  members: OracleMember[];
}

export interface OracleVoteResponse {
  success: boolean;
  consensusReached: boolean;
  approvalCount: number;
  threshold: number;
  totalMembers: number;
}

export interface OracleApprovalsResponse {
  loanId: string;
  approvalCount: number;
  threshold: number;
  totalMembers: number;
}

export interface SlashResponse {
  success: boolean;
  marked: boolean;
  error?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  contractAddress: string;
  mockMode: boolean;
}

// ============================================
// API Functions
// ============================================

/**
 * Request a new loan
 * POST /api/loan/request
 */
export async function requestLoan(
  loanAmount: number,
  poolAddress: string,
  defaultTermDays: number
): Promise<LoanRequestResponse> {
  return apiFetch<LoanRequestResponse>('/api/loan/request', {
    method: 'POST',
    body: JSON.stringify({
      loanAmount,
      poolAddress,
      defaultTermDays,
    }),
  });
}

/**
 * Trigger slashing for a defaulted loan
 * POST /api/loan/slash
 */
export async function triggerSlashing(loanId: string): Promise<SlashResponse> {
  return apiFetch<SlashResponse>('/api/loan/slash', {
    method: 'POST',
    body: JSON.stringify({ loanId }),
  });
}

/**
 * Get details of a specific loan
 * GET /api/loan/:id
 */
export async function getLoanDetails(loanId: string): Promise<LoanDetails | null> {
  return apiFetch<LoanDetails | null>(`/api/loan/${loanId}`);
}

/**
 * Get list of oracle members
 * GET /api/oracle/members
 */
export async function getOracleMembers(): Promise<OracleMembersResponse> {
  return apiFetch<OracleMembersResponse>('/api/oracle/members');
}

/**
 * Cast an oracle vote for a loan
 * POST /api/oracle/vote
 */
export async function oracleVote(
  loanId: string,
  oracleMemberId: string
): Promise<OracleVoteResponse> {
  return apiFetch<OracleVoteResponse>('/api/oracle/vote', {
    method: 'POST',
    body: JSON.stringify({ loanId, oracleMemberId }),
  });
}

/**
 * Get oracle approval count for a loan
 * GET /api/oracle/approvals/:loanId
 */
export async function getOracleApprovals(
  loanId: string
): Promise<OracleApprovalsResponse> {
  return apiFetch<OracleApprovalsResponse>(`/api/oracle/approvals/${loanId}`);
}

/**
 * Check API health status
 * GET /api/health
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health');
}