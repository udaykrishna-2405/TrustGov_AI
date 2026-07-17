import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { calculateTrustScore, generatePredictions } from '../services/aiService';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const wid = req.user!.workspaceId;
    const [issues, projects, funds, feedback, resolvedIssues, flaggedFunds] = await Promise.all([
      supabase.from('issues').select('id, status, priority, category, created_at', { count: 'exact' }).eq('workspace_id', wid),
      supabase.from('projects').select('id, status, budget', { count: 'exact' }).eq('workspace_id', wid),
      supabase.from('fund_allocations').select('id, amount, status, ai_risk_score').eq('workspace_id', wid),
      supabase.from('feedback').select('rating').eq('workspace_id', wid),
      supabase.from('issues').select('id').eq('workspace_id', wid).eq('status', 'Resolved'),
      supabase.from('fund_allocations').select('id').eq('workspace_id', wid).eq('status', 'Flagged'),
    ]);

    const totalIssues = issues.count || 0;
    const resolvedCount = resolvedIssues.data?.length || 0;
    const totalBudget = funds.data?.reduce((s, f) => s + (Number(f.amount) || 0), 0) || 0;
    const avgRating = feedback.data?.length
      ? feedback.data.reduce((s, f) => s + ((f as any).rating || 0), 0) / feedback.data.length
      : 0;

    const priorityBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    issues.data?.forEach((i: any) => {
      priorityBreakdown[i.priority] = (priorityBreakdown[i.priority] || 0) + 1;
      categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1;
      statusBreakdown[i.status] = (statusBreakdown[i.status] || 0) + 1;
    });

    // AI Trust Score — non-blocking
    let trustScore: any = null;
    try {
      trustScore = await calculateTrustScore({
        totalIssues,
        resolvedIssues: resolvedCount,
        avgResolutionDays: 7,
        overdueIssues: 0,
        citizenRating: avgRating,
        flaggedTransactions: flaggedFunds.data?.length || 0,
      });
    } catch {}

    res.json({
      success: true,
      stats: {
        totalIssues,
        resolvedIssues: resolvedCount,
        resolutionRate: totalIssues ? Math.round((resolvedCount / totalIssues) * 100) : 0,
        totalProjects: projects.count || 0,
        activeProjects: projects.data?.filter((p: any) => p.status === 'In Progress').length || 0,
        totalBudgetAllocated: totalBudget,
        flaggedTransactions: flaggedFunds.data?.length || 0,
        avgCitizenRating: Math.round(avgRating * 10) / 10,
        priorityBreakdown,
        categoryBreakdown,
        statusBreakdown,
        trustScore,
      },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/departments
router.get('/departments', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, description, head_user_id')
    .eq('workspace_id', req.user!.workspaceId)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, departments: data });
});

// GET /api/dashboard/ai-insights — predictive analytics
router.get('/ai-insights', async (req: AuthRequest, res: Response) => {
  try {
    const wid = req.user!.workspaceId;
    const { data: issues } = await supabase
      .from('issues')
      .select('category, created_at')
      .eq('workspace_id', wid)
      .order('created_at', { ascending: true });

    // Build monthly counts (last 6 months)
    const now = new Date();
    const issueCountsByMonth: number[] = new Array(6).fill(0);
    const categoryTrends: Record<string, number> = {};
    issues?.forEach((i: any) => {
      const monthsAgo = Math.floor((now.getTime() - new Date(i.created_at).getTime()) / (30 * 24 * 3600 * 1000));
      if (monthsAgo < 6) issueCountsByMonth[5 - monthsAgo]++;
      categoryTrends[i.category] = (categoryTrends[i.category] || 0) + 1;
    });

    const predictions = await generatePredictions({
      issueCountsByMonth,
      categoryTrends,
      resolutionRates: [0.7, 0.72, 0.75, 0.73, 0.78, 0.80],
    });

    res.json({ success: true, predictions, issueCountsByMonth, categoryTrends });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/workspace — current workspace info
router.get('/workspace', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name, type, logo_url, description, is_active, created_at')
    .eq('id', req.user!.workspaceId)
    .single();
  if (error) return res.status(404).json({ error: 'Workspace not found' });
  res.json({ success: true, workspace: data });
});

export default router;
