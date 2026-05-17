# Backend Task List

**Generated:** May 17, 2026
**Target:** Backend complete with oracle demo endpoints, deploy.ts working, tests passing
**Test count target:** 65+ (currently ~58)

---

## Legend

- `☐` — Not started
- `🔄` — In progress
- `✅` — Completed
- `🔴` — Blocked

---

## Step 1 — Security Quick Check (2 files, 2m)

| # | Task | File | Est. | Done |
|---|------|------|------|------|
| 1.1 | Verify `.env` is not tracked by git | `.gitignore` | 2m | ☐ |
| 1.2 | If tracked: `git rm --cached .env`, rotate all secrets | `.env` | 10m | ☐ |

*Why first:* 30-second safety check before any other work. Secrets must not leak.

---

## Step 2 — Oracle Demo Endpoints (1 file, 2h)

**File:** `backend/src/routes/oracle.routes.ts`
**Value:** Demo-ready API for auto-vote, clear, reveal-identity, reset

| # | Route | Auth | Behavior | Est. | Done |
|---|-------|------|----------|------|------|
| 2.1 | `POST /api/oracle/clear/:loanId` | JWT | `committee.clearVotes(loanId)` → `{ success, cleared }` | 30m | ☐ |
| 2.2 | `POST /api/oracle/auto-vote/:loanId` | JWT | Votes oracle-1 + oracle-2. Guarded by `MOCK_ORACLE_MODE=true` | 30m | ☐ |
| 2.3 | `GET /api/oracle/revealed-identity/:loanId` | JWT | If approvals ≥ 2: decrypt identity → `IdentityData`. Else: 403 | 45m | ☐ |
| 2.4 | `DELETE /api/oracle/reset` | JWT | `mockOracleService.clearAllData()` → `{ success, reset }` | 15m | ☐ |

*Why second:* Highest demo impact. No dependencies. Self-contained in one file.

---

## Step 3 — API Route Tests for Oracle Endpoints (1 file, 1h)

**File:** `backend/src/__tests__/server.test.ts`

| # | Test | Est. | Done |
|---|------|------|------|
| 3.1 | `POST /api/oracle/clear/:loanId` — clears votes | 15m | ☐ |
| 3.2 | `POST /api/oracle/auto-vote/:loanId` — both oracles vote, consensus reached | 15m | ☐ |
| 3.3 | `GET /api/oracle/revealed-identity/:loanId` — pre-consensus: 403, post-consensus: identity | 30m | ☐ |
| 3.4 | `DELETE /api/oracle/reset` — all data wiped | 10m | ☐ |

*Why third:* Verifies Step 2 works. Must come after endpoints exist.

---

## Step 4 — Deploy Script Audit (1 file, 1.5h)

**File:** `backend/scripts/deploy.ts`

| # | Task | Est. | Deps | Done |
|---|------|------|------|------|
| 4.1 | Audit imports: verify each `@midnight-ntwrk/*` import resolves against `node_modules/` | 30m | — | ☐ |
| 4.2 | Fix any import path mismatches (subpath exports vs. package names) | 30m | 4.1 | ☐ |
| 4.3 | Verify compilation: `npx tsc --noEmit --skipLibCheck scripts/deploy.ts` | 15m | 4.2 | ☐ |
| 4.4 | Document any remaining blockers and fallback path (compiled/mock mode) | 10m | 4.3 | ☐ |

*Why fourth:* Important for testnet deployment but not blocking for demo (compiled + mock fallback exist).

**Fallback:** If deploy.ts cannot compile, use compiled-contract mode (Tier 2) for the demo.

---

## Step 5 — Missing Unit Tests (1 file, 1.5h)

**File:** `backend/src/__tests__/index.test.ts`

| # | Test | What it checks | Est. | Done |
|---|------|----------------|------|------|
| 5.1 | E2: `requestLoan` with low score | Score < 680 → request fails | 30m | ☐ |
| 5.2 | E3: `triggerSlashing` before deadline | Deadline not exceeded → slash fails | 45m | ☐ |
| 5.3 | E7: BigInt serialization | Loan + pool BigInt fields are strings in JSON | 20m | ☐ |

*Why fifth:* Edge case tests — important but not blocking for demo.

---

## Step 6 — Final Validation (30m)

| # | Task | Deps | Done |
|---|------|------|------|
| 6.1 | Run full test suite: `cd backend && npm test` | Steps 1–5 | ☐ |
| 6.2 | Fix any test regressions | 6.1 | ☐ |
| 6.3 | Run lint: `cd backend && npm run lint` | 6.2 | ☐ |

---

## Files Changed

| File | What | Lines |
|------|------|-------|
| `backend/src/routes/oracle.routes.ts` | 4 new routes | ~+80 |
| `backend/src/__tests__/server.test.ts` | 4 new test blocks | ~+60 |
| `backend/src/__tests__/index.test.ts` | 3 new unit tests | ~+50 |
| `backend/scripts/deploy.ts` | Import path fixes (if needed) | 0–5 |

No frontend changes. No new files besides this checklist.

---

## Acceptance

- `cd backend && npm test` — 65+ tests pass
- `cd backend && npm run lint` — clean
- 4 new oracle endpoints accessible
- `deploy.ts` compiles clean or blockers documented
