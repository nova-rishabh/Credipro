#!/usr/bin/env node
import 'dotenv/config';

async function tryImport(pkg: string) {
  try {
    const mod = await import(pkg);
    return { pkg, mod };
  } catch (e) {
    return null;
  }
}

interface SdkInfo {
  pkg: string;
  mod: Record<string, unknown>;
  capabilities: string[];
}

async function detectSdk(): Promise<SdkInfo | null> {
  const contractPkg = await tryImport('@midnight-ntwrk/midnight-js-contracts');
  if (contractPkg) {
    const m = contractPkg.mod as any;
    const caps: string[] = [];
    if (typeof m.deployContract === 'function') caps.push('deployContract');
    if (typeof m.findDeployedContract === 'function') caps.push('findDeployedContract');
    if (typeof m.submitDeployTx === 'function') caps.push('submitDeployTx');
    if (typeof m.submitCallTx === 'function') caps.push('submitCallTx');
    if (typeof m.createUnprovenDeployTx === 'function') caps.push('createUnprovenDeployTx');
    return { pkg: contractPkg.pkg, mod: contractPkg.mod, capabilities: caps };
  }

  const walletPkg = await tryImport('@midnight-ntwrk/wallet-sdk');
  if (walletPkg) {
    const m = walletPkg.mod as any;
    const caps: string[] = [];
    if (typeof m.WalletFacade === 'function') caps.push('WalletFacade');
    if (typeof m.HDWallet === 'function') caps.push('HDWallet');
    if (typeof m.WalletSeed === 'function') caps.push('WalletSeed');
    return { pkg: walletPkg.pkg, mod: walletPkg.mod, capabilities: caps };
  }

  const compactPkg = await tryImport('@midnight-ntwrk/compact-js');
  if (compactPkg) {
    const caps: string[] = [];
    if ((compactPkg.mod as any).CompiledContract) caps.push('CompiledContract');
    if ((compactPkg.mod as any).ContractExecutable) caps.push('ContractExecutable');
    return { pkg: compactPkg.pkg, mod: compactPkg.mod, capabilities: caps };
  }

  return null;
}

async function main() {
  console.log('[DEPLOY] Starting deploy script (dry mode by default)');

  const sdk = await detectSdk();
  if (!sdk) {
    console.error('[DEPLOY] No Midnight SDK packages found.');
    console.error('[DEPLOY] Expected one of: @midnight-ntwrk/midnight-js-contracts, @midnight-ntwrk/wallet-sdk, @midnight-ntwrk/compact-js');
    console.error('[DEPLOY] Run: npm install @midnight-ntwrk/midnight-js-contracts @midnight-ntwrk/wallet-sdk @midnight-ntwrk/compact-js');
    process.exitCode = 2;
    return;
  }

  console.log('[DEPLOY] Found SDK package:', sdk.pkg);
  console.log('[DEPLOY] Capabilities:', sdk.capabilities.join(', ') || '(none detected)');

  const rpc = process.env.MIDNIGHT_RPC;
  const seed = process.env.MIDNIGHT_WALLET_SEED || process.env.MIDNIGHT_PRIVATE_KEY;

  console.log('[DEPLOY] MIDNIGHT_RPC present:', !!rpc);
  console.log('[DEPLOY] MIDNIGHT_WALLET_SEED/PRIVATE_KEY present:', !!seed);
  console.log('[DEPLOY] MIDNIGHT_CONTRACT_ADDRESS:', process.env.MIDNIGHT_CONTRACT_ADDRESS || '(not set)');

  const runDeploy = process.env.RUN_DEPLOY === 'true';
  if (!runDeploy) {
    console.log('[DEPLOY] Dry validation complete.');
    console.log('[DEPLOY]');
    console.log('[DEPLOY] To deploy to testnet:');
    console.log('[DEPLOY]   1. Set MIDNIGHT_RPC, MIDNIGHT_WALLET_SEED, RUN_DEPLOY=true');
    console.log('[DEPLOY]   2. Run: npm run deploy');
    console.log('[DEPLOY]');
    console.log('[DEPLOY] After deployment, copy the contract address to .env as MIDNIGHT_CONTRACT_ADDRESS');
    process.exitCode = 0;
    return;
  }

  if (!rpc) {
    console.error('[DEPLOY] MIDNIGHT_RPC is required to deploy. Aborting.');
    process.exitCode = 3;
    return;
  }
  if (!seed) {
    console.error('[DEPLOY] MIDNIGHT_WALLET_SEED or MIDNIGHT_PRIVATE_KEY is required to deploy. Aborting.');
    process.exitCode = 4;
    return;
  }

  console.log('[DEPLOY] Running live deploy...');

  try {
    if (sdk.capabilities.includes('deployContract')) {
      console.log('[DEPLOY] Using midnight-js-contracts deployContract()');
      const mod = sdk.mod as any;
      const compiledContract = await import('../contracts/contract/index.js');
      const result = await mod.deployContract(
        { url: rpc },
        { seed },
        compiledContract.Contract,
      );
      console.log('[DEPLOY] Deploy result:', JSON.stringify(result, null, 2));
      if (result && result.contractAddress) {
        console.log('[DEPLOY] === CONTRACT ADDRESS ===', result.contractAddress);
        console.log('[DEPLOY] Add this to your .env file:');
        console.log(`[DEPLOY] MIDNIGHT_CONTRACT_ADDRESS=${result.contractAddress}`);
      }
      process.exitCode = 0;
      return;
    }

    if (sdk.capabilities.includes('WalletFacade')) {
      console.log('[DEPLOY] Using wallet-sdk WalletFacade for deployment');
      console.log('[DEPLOY] WalletFacade detected. For a full deploy flow, also install @midnight-ntwrk/midnight-js-contracts.');
      console.log('[DEPLOY] Partial deployment not implemented yet.');
      process.exitCode = 0;
      return;
    }

    console.error('[DEPLOY] No deploy-capable SDK shape detected. Install @midnight-ntwrk/midnight-js-contracts.');
    process.exitCode = 5;
    return;
  } catch (e: any) {
    console.error('[DEPLOY] Deployment attempt failed:', e && e.message ? e.message : e);
    process.exitCode = 10;
    return;
  }
}

main();
