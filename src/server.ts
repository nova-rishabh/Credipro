import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { CrediproClient } from './contract';
import { mockOracleService } from './oracle';
import { toBytes32, RequestLoanResponse, TriggerSlashingResponse, LoanRecord } from './types';
import { logger } from './logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'credipro-dev-secret';

app.use(cors());
app.use(express.json());

export interface AuthenticatedRequest extends Request {
  user?: any;
}

let contractAddress;
try {
  if (process.env.MIDNIGHT_CONTRACT_ADDRESS) {
    contractAddress = toBytes32(process.env.MIDNIGHT_CONTRACT_ADDRESS);
  } else {
    contractAddress = toBytes32('0x' + '1'.repeat(64));
  }
} catch (err) {
  logger.warn('[SERVER] Invalid MIDNIGHT_CONTRACT_ADDRESS, falling back to default bytes32:', err instanceof Error ? err.message : err);
  contractAddress = toBytes32('0x' + '1'.repeat(64));
}

const client = new CrediproClient(contractAddress, {}, mockOracleService);

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/token', (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ error: 'Missing username' });
    return;
  }

  const token = jwt.sign({ username, role: 'borrower' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contractAddress,
    mockMode: process.env.MOCK_ORACLE_MODE !== 'false',
  });
});

app.post('/api/loan/request', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
    logger.error('[SERVER] POST /api/loan/request error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.post('/api/loan/slash', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
    logger.error('[SERVER] POST /api/loan/slash error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/loan/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
    logger.error('[SERVER] GET /api/loan/:id error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/pool/:address', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
    logger.error('[SERVER] GET /api/pool/:address error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.post('/api/oracle/vote', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { loanId, oracleMemberId } = req.body;

    if (!loanId || !oracleMemberId) {
      res.status(400).json({ error: 'Missing required fields: loanId, oracleMemberId' });
      return;
    }

    const consensus = await mockOracleService.voteApproval(toBytes32(loanId), oracleMemberId);
    const approvalCount = await mockOracleService.getApprovalCount(toBytes32(loanId));
    
    // Dynamic thresholds based on environment or default 2/3
    const totalMembers = process.env.ORACLE_MEMBER_COUNT ? parseInt(process.env.ORACLE_MEMBER_COUNT) : 3;
    const threshold = process.env.ORACLE_THRESHOLD ? parseInt(process.env.ORACLE_THRESHOLD) : 2;

    res.json({
      success: true,
      consensusReached: consensus,
      approvalCount,
      threshold,
      totalMembers,
    });
  } catch (error) {
    logger.error('[SERVER] POST /api/oracle/vote error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/oracle/approvals/:loanId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approvals = await client.getOracleApprovals(toBytes32(req.params.loanId));
    const totalMembers = process.env.ORACLE_MEMBER_COUNT ? parseInt(process.env.ORACLE_MEMBER_COUNT) : 3;
    const threshold = process.env.ORACLE_THRESHOLD ? parseInt(process.env.ORACLE_THRESHOLD) : 2;

    res.json({
      loanId: req.params.loanId,
      approvalCount: approvals,
      threshold,
      totalMembers,
    });
  } catch (error) {
    logger.error('[SERVER] GET /api/oracle/approvals/:loanId error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.get('/api/oracle/members', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const members = mockOracleService.getOracleMembers();
  res.json({ members });
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`[SERVER] Credipro backend running on port ${PORT}`);
    logger.info(`[SERVER] Mock mode: ${process.env.MOCK_ORACLE_MODE !== 'false'}`);
    logger.info(`[SERVER] Contract address: ${contractAddress}`);
  });
}

export default app;
