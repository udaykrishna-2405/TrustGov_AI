import crypto from 'crypto';

interface IntegrityRecordInput {
  userId: string;
  serviceId: string;
  timestamp: string;
}

interface FabricSubmitResponse {
  success?: boolean;
  txId?: string;
  transactionId?: string;
  message?: string;
}

type VerificationMode = 'fabric-bridge' | 'demo';

interface IntegrityLogResult {
  hash: string;
  blockchainTxId: string;
  verificationMode: VerificationMode;
  blockchainVerified: boolean;
}

const isTrue = (value?: string) => (value || '').toLowerCase() === 'true';

const getBlockchainMode = () => (process.env.BLOCKCHAIN_MODE || 'demo').toLowerCase();

const generateDemoTxId = (hash: string): string => {
  const shortHash = crypto
    .createHash('sha256')
    .update(hash + Date.now())
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
  return `DEMO-${shortHash}`;
};

const submitToFabricBridge = async (input: IntegrityRecordInput, hash: string): Promise<string | null> => {
  const submitUrl = process.env.FABRIC_SUBMIT_URL;
  if (!submitUrl) return null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.FABRIC_SUBMIT_API_KEY) {
    headers['x-api-key'] = process.env.FABRIC_SUBMIT_API_KEY;
  }

  const response = await fetch(submitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: input.userId,
      serviceId: input.serviceId,
      timestamp: input.timestamp,
      hash,
    }),
  });

  if (!response.ok) {
    throw new Error(`[FABRIC] Submit endpoint responded with ${response.status}.`);
  }

  const data = (await response.json()) as FabricSubmitResponse;
  const txId = data.txId || data.transactionId;

  if (!txId) {
    throw new Error('[FABRIC] Missing txId in submit response.');
  }

  if (data.success === false) {
    throw new Error(data.message || '[FABRIC] Submit endpoint reported failure.');
  }

  return txId;
};

export const logIntegrityRecord = async (input: IntegrityRecordInput): Promise<IntegrityLogResult> => {
  const payload = `${input.userId}:${input.serviceId}:${input.timestamp}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  const mode = getBlockchainMode();
  const fabricStrict = isTrue(process.env.FABRIC_BRIDGE_REQUIRED);

  const shouldTryFabric =
    Boolean(process.env.FABRIC_SUBMIT_URL) || mode === 'fabric' || mode === 'fabric-bridge';

  if (shouldTryFabric) {
    try {
      const fabricTxId = await submitToFabricBridge(input, hash);
      if (fabricTxId) {
        console.log(`[Blockchain] mode: fabric-bridge | txId: ${fabricTxId}`);
        return {
          hash,
          blockchainTxId: fabricTxId,
          verificationMode: 'fabric-bridge',
          blockchainVerified: true,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Fabric error';
      if (fabricStrict || mode === 'fabric' || mode === 'fabric-bridge') {
        throw new Error(`[FABRIC] Submit failed in strict mode. ${message}`);
      }
      console.warn(`[FABRIC] Submit failed, falling back to demo mode. ${message}`);
    }
  }

  // Demo mode — always works, generates SHA-256 based txId locally
  const blockchainTxId = generateDemoTxId(hash);
  console.log(`[Blockchain] mode: demo | txId: ${blockchainTxId}`);

  return {
    hash,
    blockchainTxId,
    verificationMode: 'demo',
    blockchainVerified: false,
  };
};
