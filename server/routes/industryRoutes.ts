import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import {
  predictMachineHealth,
  analyzeQualityReading,
  scoreSupplierRisk,
  analyzeSafetyIncident,
} from '../services/aiService';
import { submitToBlockchain } from '../services/blockchain';

const router = Router();
router.use(authenticate);

// ── MACHINES ─────────────────────────────────────────────────────

// GET /api/industry/machines
router.get('/machines', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('machines')
    .select('*, departments(name)')
    .eq('workspace_id', req.user!.workspaceId)
    .order('health_score', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, machines: data });
});

// POST /api/industry/machines
router.post(
  '/machines',
  requireRole('plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, model, serialNumber, installationDate, departmentId } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });
      const { data, error } = await supabase
        .from('machines')
        .insert({
          workspace_id: req.user!.workspaceId,
          name,
          model: model || null,
          serial_number: serialNumber || null,
          installation_date: installationDate || null,
          department_id: departmentId || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, machine: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// POST /api/industry/machines/:id/health-log
router.post('/machines/:id/health-log', async (req: AuthRequest, res: Response) => {
  try {
    const { symptomType, severity, description } = req.body;
    if (!symptomType || !description) {
      return res.status(400).json({ error: 'symptomType and description required' });
    }
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .eq('id', req.params.id)
      .eq('workspace_id', req.user!.workspaceId)
      .single();
    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const { data: recentLogs } = await supabase
      .from('machine_health_logs')
      .select('symptom_type, description')
      .eq('machine_id', req.params.id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(5);

    let aiPrediction: any = {};
    try {
      aiPrediction = await predictMachineHealth({
        machineName: machine.name,
        recentSymptoms: [
          ...(recentLogs?.map((l: any) => `${l.symptom_type}: ${l.description}`) || []),
          `${symptomType}: ${description}`,
        ],
        daysSinceLastMaintenance: machine.last_maintenance_date
          ? Math.floor((Date.now() - new Date(machine.last_maintenance_date).getTime()) / 86400000)
          : 999,
        currentHealthScore: machine.health_score,
      });
    } catch (e) { console.warn('[Machine] AI skipped:', e); }

    const { data, error } = await supabase
      .from('machine_health_logs')
      .insert({
        machine_id: req.params.id,
        workspace_id: req.user!.workspaceId,
        reported_by: req.user!.userId,
        symptom_type: symptomType,
        severity: severity || 'Minor',
        description,
        ai_failure_probability: aiPrediction.failureProbability || null,
        ai_predicted_failure_date: aiPrediction.predictedFailureDays
          ? new Date(Date.now() + aiPrediction.predictedFailureDays * 86400000).toISOString().split('T')[0]
          : null,
        ai_recommended_action: aiPrediction.recommendedAction || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Downgrade machine health score if AI sees high risk
    if ((aiPrediction.failureProbability || 0) > 0.7) {
      const newScore = Math.max(0, machine.health_score - 20);
      await supabase.from('machines').update({
        health_score: newScore,
        status: newScore < 40 ? 'At Risk' : machine.status,
      }).eq('id', req.params.id);
    }

    res.status(201).json({ success: true, log: data, aiPrediction });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── PRODUCTION BATCHES ────────────────────────────────────────────

// GET /api/industry/batches
router.get('/batches', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('production_batches')
    .select('*, departments(name), quality_gate_checks(*)')
    .eq('workspace_id', req.user!.workspaceId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, batches: data });
});

// POST /api/industry/batches
router.post(
  '/batches',
  requireRole('officer', 'team_member', 'partner', 'department_head', 'manager', 'plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { batchNumber, productName, departmentId, quantity, unit, totalStages } = req.body;
      if (!batchNumber || !productName) {
        return res.status(400).json({ error: 'batchNumber and productName required' });
      }
      const { txId } = await submitToBlockchain({
        type: 'batch_started',
        batchNumber, productName,
        timestamp: new Date().toISOString(),
      });
      const { data, error } = await supabase
        .from('production_batches')
        .insert({
          workspace_id: req.user!.workspaceId,
          batch_number: batchNumber,
          product_name: productName,
          department_id: departmentId || null,
          quantity: quantity || null,
          unit: unit || null,
          total_stages: totalStages || 4,
          start_time: new Date().toISOString(),
          blockchain_tx_id: txId,
          created_by: req.user!.userId,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, batch: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// POST /api/industry/batches/:id/quality-check
router.post('/batches/:id/quality-check', async (req: AuthRequest, res: Response) => {
  try {
    const { stageNumber, stageName, parameterName, actualValue, minAcceptable, maxAcceptable, notes } = req.body;
    const { data: batch } = await supabase
      .from('production_batches')
      .select('product_name')
      .eq('id', req.params.id)
      .single();

    let aiAnalysis: any = {};
    try {
      aiAnalysis = await analyzeQualityReading({
        productName: batch?.product_name || '',
        stageName,
        parameter: parameterName,
        actualValue,
        acceptableRange: `${minAcceptable} - ${maxAcceptable}`,
        previousReadings: [],
      });
    } catch {}

    const { txId } = await submitToBlockchain({
      type: 'quality_check',
      batchId: req.params.id,
      stage: stageNumber,
      result: aiAnalysis.result,
    });

    const { data, error } = await supabase
      .from('quality_gate_checks')
      .insert({
        batch_id: req.params.id,
        workspace_id: req.user!.workspaceId,
        stage_number: stageNumber,
        stage_name: stageName,
        parameter_name: parameterName || null,
        actual_value: actualValue,
        min_acceptable: minAcceptable || null,
        max_acceptable: maxAcceptable || null,
        result: aiAnalysis.result || 'Hold',
        checked_by: req.user!.userId,
        ai_defect_probability: aiAnalysis.defectProbability || null,
        ai_root_cause: aiAnalysis.rootCause || null,
        notes: notes || null,
        blockchain_tx_id: txId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (aiAnalysis.result === 'Fail') {
      await supabase.from('production_batches').update({ status: 'Failed' }).eq('id', req.params.id);
    }
    res.status(201).json({ success: true, check: data, aiAnalysis });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── SUPPLIERS ─────────────────────────────────────────────────────

// GET /api/industry/suppliers
router.get('/suppliers', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('workspace_id', req.user!.workspaceId)
    .order('on_time_rate', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, suppliers: data });
});

// POST /api/industry/suppliers
router.post('/suppliers', requireRole('plant_head', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, contactEmail, contactPhone, gstin, materialCategory } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        workspace_id: req.user!.workspaceId,
        name,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        gstin: gstin || null,
        material_category: materialCategory || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, supplier: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/industry/suppliers/:id/score — AI risk scoring
router.post('/suppliers/:id/score', async (req: AuthRequest, res: Response) => {
  try {
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .eq('workspace_id', req.user!.workspaceId)
      .single();
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const { data: deliveries } = await supabase
      .from('supplier_deliveries')
      .select('quality_status, delay_days')
      .eq('supplier_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentIssues = deliveries
      ?.filter((d: any) => d.quality_status === 'Failed' || (d.delay_days || 0) > 3)
      .map((d: any) => d.quality_status === 'Failed' ? 'Quality failure' : `Delayed by ${d.delay_days} days`) || [];

    const result = await scoreSupplierRisk({
      supplierName: supplier.name,
      onTimeRate: supplier.on_time_rate,
      qualityPassRate: supplier.quality_pass_rate,
      totalOrders: supplier.total_orders,
      recentIssues,
    });

    await supabase.from('suppliers').update({
      ai_risk_level: result.riskLevel,
      ai_recommendation: result.recommendation,
    }).eq('id', req.params.id);

    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── SAFETY INCIDENTS ──────────────────────────────────────────────

// GET /api/industry/safety-incidents
router.get('/safety-incidents', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('safety_incidents')
    .select('*, departments(name), users!reported_by(name)')
    .eq('workspace_id', req.user!.workspaceId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, incidents: data });
});

// POST /api/industry/safety-incidents
router.post('/safety-incidents', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, incidentType, severity, location, departmentId, incidentTime } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description required' });
    }
    let aiAnalysis: any = {};
    try {
      aiAnalysis = await analyzeSafetyIncident({ type: incidentType, description, location, severity });
    } catch {}

    const { txId } = await submitToBlockchain({
      type: 'safety_incident', title, severity, timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('safety_incidents')
      .insert({
        workspace_id: req.user!.workspaceId,
        reported_by: req.user!.userId,
        department_id: departmentId || null,
        incident_type: incidentType,
        severity: severity || 'Medium',
        title, description,
        location: location || null,
        incident_time: incidentTime || new Date().toISOString(),
        ai_root_causes: aiAnalysis.rootCauses || [],
        ai_corrective_actions: aiAnalysis.correctiveActions || [],
        blockchain_tx_id: txId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, incident: data, aiAnalysis });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
