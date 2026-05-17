/**
 * Credipro API Service Layer
 * Typed API client for communicating with the Express backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3001';

// Lazily cached auth token — fetched from backend on first use
let authToken: string | null = null;

async function ensureAuthToken(): Promise<string> {
  if (authToken) return authToken;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mvp-frontend-user' }),
    });
    const data = await res.json();
    if (data.token) {
      authToken = String(data.token);
      return authToken;
    }
    throw new Error(data.error || 'Failed to retrieve authentication token');
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error('Authentication service unavailable');
  }
}

/**
 * Generic fetch wrapper with auth headers and error handling.
 * Automatically obtains and caches a JWT from the backend.
 * Throws on non-OK HTTP responses for proper error handling by callers.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = await ensureAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Timeout support using AbortController (default 30s)
  const timeoutMs = (options as any).timeoutMs ?? 30000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(url, {
    ...options,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));

  if (response.status === 0) {
    throw new Error('Network error or request aborted');
  }

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
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
  id: string;
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
  contractAddress?: string;
  mode?: 'demo' | 'production';
  mockMode?: boolean;
  compiledContractPresent?: boolean; 
  contractConnected?: boolean;
  missingEnvVars?: string[];
}

export interface ModeResponse {
  mode: 'demo' | 'production';
  success?: boolean;
  missingEnvVars?: string[];
  error?: string;
}

export interface PoolDetails {
  tvl: string;
  riskParams: {
    minCreditScore: number;
    maxLTV: number;
    minMonthlyIncome: string;
    maxLoanAmount: string;
  };
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

/**
 * Get pool details
 * GET /api/pool/:address
 */
export async function getPoolDetails(address: string): Promise<PoolDetails | null> {
  return apiFetch<PoolDetails | null>(`/api/pool/${address}`);
}

/**
 * Get current app mode
 * GET /api/mode
 */
export async function getMode(): Promise<ModeResponse> {
  return apiFetch<ModeResponse>('/api/mode');
}

/**
 * Set app mode (demo or production)
 * PUT /api/mode
 */
export async function setMode(mode: 'demo' | 'production'): Promise<ModeResponse> {
  return apiFetch<ModeResponse>('/api/mode', {
    method: 'PUT',
    body: JSON.stringify({ mode }),
  });
}