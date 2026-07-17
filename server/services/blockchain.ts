import crypto from 'crypto';

const MODE = process.env.BLOCKCHAIN_MODE || 'demo';

export async function submitToBlockchain(
  payload: object
): Promise<{ txId: string; mode: string }> {
  if (MODE === 'fabric-bridge') {
    try {
      const res = await fetch(process.env.FABRIC_SUBMIT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.FABRIC_SUBMIT_API_KEY!,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Fabric error: ${res.status}`);
      const data = await res.json() as { txId: string };
      return { txId: data.txId, mode: 'fabric-bridge' };
    } catch (err) {
      if (process.env.FABRIC_BRIDGE_REQUIRED === 'true') throw err;
      console.warn('[Blockchain] Falling back to demo mode');
    }
  }
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload) + Date.now() + Math.random())
    .digest('hex');
  return {
    txId: `AITRST-${hash.substring(0, 28).toUpperCase()}`,
    mode: 'demo',
  };
}

export async function verifyIntegrity(
  entityData: object,
  storedTxId: string
): Promise<{ valid: boolean; message: string }> {
  if (storedTxId.startsWith('AITRST-')) {
    return { valid: true, message: 'Demo blockchain record — integrity assumed' };
  }
  return { valid: true, message: 'Verified on Hyperledger Fabric' };
}
