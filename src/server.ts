import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { CrediproClient } from './contract';
import { mockOracleService } from './oracle';
import { toBytes32, RequestLoanResponse, TriggerSlashingResponse, LoanRecord } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'credipro-dev-secret';

app.use(express.json());

const contractAddress = toBytes32(process.env.MIDNIGHT_CONTRACT_ADDRESS || '0x' + '1'.repeat(64));
const client = new CrediproClient(contractAddress, {}, mockOracleService);

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contractAddress,
    mockMode: process.env.MOCK_ORACLE_MODE !== 'false',
  });
});

app.post('/api/loan/request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { loanAmount, poolAddress, defaultTermDays } = req.body;

    if (!loanAmount || !poolAddress || !defaultTermDays) {
      res.status(400).json({ error: 'Missing required fields: loanAmount, poolAddress, defaultTermDays' });
      return;
    }

    const result: RequestLoanResponse = await client.requestLoan(
      BigInt(loanAmount),
      toBytes32(poolAddress),
      BigInt(defaultTermDays),
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[SERVER] POST /api/loan/request error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.post('/api/loan/slash', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { loanId } = req.body;

    if (!loanId) {
      res.status(400).json({ error: 'Missing required field: loanId' });
      return;
    }

    const result: TriggerSlashingResponse = await client.triggerSlashing(toBytes32(loanId));

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[SERVER] POST /api/loan/slash error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/loan/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const loan: LoanRecord | null = await client.getLoanDetails(toBytes32(req.params.id));

    if (loan) {
      res.json({
        ...loan,
        disbursedAmount: loan.disbursedAmount.toString(),
        defaultThreshold: loan.defaultThreshold.toString(),
      });
    } else {
      res.status(404).json({ error: 'Loan not found' });
    }
  } catch (error) {
    console.error('[SERVER] GET /api/loan/:id error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/pool/:address', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pool = await client.getPoolDetails(toBytes32(req.params.address));

    if (pool) {
      res.json({
        tvl: pool.tvl.toString(),
        riskParams: {
          ...pool.riskParams,
          minMonthlyIncome: pool.riskParams.minMonthlyIncome.toString(),
        },
      });
    } else {
      res.status(404).json({ error: 'Pool not found' });
    }
  } catch (error) {
    console.error('[SERVER] GET /api/pool/:address error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.post('/api/oracle/vote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { loanId, oracleMemberId } = req.body;

    if (!loanId || !oracleMemberId) {
      res.status(400).json({ error: 'Missing required fields: loanId, oracleMemberId' });
      return;
    }

    const consensus = mockOracleService.voteApproval(toBytes32(loanId), oracleMemberId);
    const approvalCount = mockOracleService.getApprovalCount(toBytes32(loanId));

    res.json({
      success: true,
      consensusReached: consensus,
      approvalCount,
      threshold: 2,
      totalMembers: 3,
    });
  } catch (error) {
    console.error('[SERVER] POST /api/oracle/vote error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/oracle/approvals/:loanId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const approvals = await client.getOracleApprovals(toBytes32(req.params.loanId));

    res.json({
      loanId: req.params.loanId,
      approvalCount: approvals,
      threshold: 2,
      totalMembers: 3,
    });
  } catch (error) {
    console.error('[SERVER] GET /api/oracle/approvals/:loanId error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/oracle/members', authMiddleware, (_req: Request, res: Response) => {
  const members = mockOracleService.getOracleMembers();
  res.json({ members });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Credipro backend running on port ${PORT}`);
  console.log(`[SERVER] Mock mode: ${process.env.MOCK_ORACLE_MODE !== 'false'}`);
  console.log(`[SERVER] Contract address: ${contractAddress}`);
});

export default app;
