import crypto from 'crypto';

const BLOCKCHAIN_MODE = process.env.BLOCKCHAIN_MODE || 'demo';
const FABRIC_SUBMIT_URL = process.env.FABRIC_SUBMIT_URL || '';
const FABRIC_SUBMIT_API_KEY = process.env.FABRIC_SUBMIT_API_KEY || '';
const FABRIC_BRIDGE_REQUIRED = process.env.FABRIC_BRIDGE_REQUIRED === 'true';

function generateDemoTxId(payload: object): string {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload) + Date.now() + Math.random())
    .digest('hex');
  return `DEMO-${hash.substring(0, 16).toUpperCase()}`;
}

export async function submitToBlockchain(
  payload: object
): Promise<{ txId: string; mode: string }> {
  if (BLOCKCHAIN_MODE === 'fabric-bridge' && FABRIC_SUBMIT_URL) {
    try {
      const response = await fetch(FABRIC_SUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': FABRIC_SUBMIT_API_KEY,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Fabric bridge: ${response.status}`);
      const data = (await response.json()) as { txId: string };
      console.log(`[Blockchain] fabric-bridge | txId: ${data.txId}`);
      return { txId: data.txId, mode: 'fabric-bridge' };
    } catch (err) {
      if (FABRIC_BRIDGE_REQUIRED) throw err;
      console.warn('[Blockchain] Fabric bridge failed, falling back to demo:', err);
    }
  }

  const { txId } = { txId: generateDemoTxId(payload) };
  console.log(`[Blockchain] mode: demo | txId: ${txId}`);
  return { txId, mode: 'demo' };
}
