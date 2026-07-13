import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// GET /api/dashboard/stats — public transparency data
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [complaints, projects, departments, resolved] = await Promise.all([
      supabase.from('complaints').select('id, status, priority, category'),
      supabase.from('projects').select('id, status, budget'),
      supabase.from('departments').select('id', { count: 'exact' }),
      supabase.from('complaints').select('id').eq('status', 'Resolved'),
    ]);

    const totalComplaints = complaints.data?.length || 0;
    const resolvedCount = resolved.data?.length || 0;
    const totalProjects = projects.data?.length || 0;
    const totalBudget = projects.data?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;

    const priorityBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};
    complaints.data?.forEach((c) => {
      priorityBreakdown[c.priority] = (priorityBreakdown[c.priority] || 0) + 1;
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalComplaints,
        resolvedComplaints: resolvedCount,
        resolutionRate: totalComplaints
          ? Math.round((resolvedCount / totalComplaints) * 100)
          : 0,
        totalProjects,
        activeProjects: projects.data?.filter((p) => p.status === 'In Progress').length || 0,
        totalBudgetAllocated: totalBudget,
        totalDepartments: departments.count || 0,
        priorityBreakdown,
        categoryBreakdown,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/dashboard/departments — public
router.get('/departments', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, description')
    .order('name');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, departments: data });
});

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
