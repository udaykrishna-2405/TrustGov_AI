import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/services — public
router.get('/services', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    services: [
      { id: 'tax', name: 'Income Tax e-Filing', description: 'File your income tax returns securely.', icon: 'FileText' },
      { id: 'passport', name: 'Passport Seva', description: 'Apply for or renew your passport.', icon: 'Plane' },
      { id: 'parivahan', name: 'Parivahan Sewa', description: 'Vehicle registration and driving license.', icon: 'Car' },
    ]
  });
});

// GET /api/activity — mock activity log
router.get('/activity', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    activity: [
      { id: '1', type: 'Login', location: 'Chennai, India', status: 'Success', timestamp: new Date().toISOString() }
    ]
  });
});

// POST /api/request-service — issue a mock token
router.post('/request-service', async (req: Request, res: Response) => {
  const { serviceId } = req.body;
  if (!serviceId) return res.status(400).json({ success: false, error: 'serviceId required' });
  
  res.json({
    success: true,
    tokenMeta: {
      tokenId: `TG-TKN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      accessLevel: 'Verified Citizen',
      validity: '15m',
      blockchainTxId: `AMB-VERIFIED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      requestHash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
    }
  });
});

export default router;
