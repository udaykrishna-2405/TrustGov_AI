-- ═══════════════════════════════════════════════════════════
-- AI TrustOS — Complete Database Schema
-- Run in Supabase SQL Editor → New Query → Run All
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── WORKSPACES ──────────────────────────────────────────────
create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('government','corporate','industry')),
  logo_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── USERS ───────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  password_hash text not null,
  role text not null default 'citizen',
  department_id uuid,
  is_active boolean default true,
  last_login timestamptz,
  last_login_ip text,
  last_login_city text,
  last_login_country text,
  last_login_lat numeric(10,6),
  last_login_lng numeric(10,6),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, email)
);

-- ── DEPARTMENTS ─────────────────────────────────────────────
create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  head_user_id uuid references users(id),
  created_at timestamptz default now()
);

-- ── LOGIN SESSIONS (impossible travel detection) ─────────────
create table if not exists login_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  ip_address text,
  city text,
  country text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  device_info text,
  browser text,
  os text,
  is_flagged boolean default false,
  flag_reason text,
  distance_from_last_km numeric(10,2),
  time_from_last_minutes numeric(10,2),
  speed_kmph numeric(10,2),
  risk_level text check (risk_level in ('low','medium','high','critical')),
  session_token text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── SECURITY ALERTS ─────────────────────────────────────────
create table if not exists security_alerts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  alert_type text not null,
  severity text check (severity in ('low','medium','high','critical')),
  description text not null,
  metadata jsonb,
  is_resolved boolean default false,
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── ISSUES (all modes) ──────────────────────────────────────
create table if not exists issues (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  submitted_by uuid not null references users(id),
  title text not null,
  description text not null,
  category text not null default 'Other',
  priority text default 'Medium' check (priority in ('Critical','High','Medium','Low')),
  status text default 'Submitted' check (status in (
    'Submitted','Assigned','In Progress','Under Review',
    'Resolved','Closed','Rejected'
  )),
  department_id uuid references departments(id),
  assigned_to uuid references users(id),
  is_anonymous boolean default false,
  ai_category text,
  ai_priority text,
  ai_summary text,
  ai_estimated_days integer,
  ai_confidence_score numeric(4,3),
  blockchain_tx_id text,
  blockchain_mode text default 'demo',
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ISSUE UPDATES ───────────────────────────────────────────
create table if not exists issue_updates (
  id uuid primary key default uuid_generate_v4(),
  issue_id uuid not null references issues(id) on delete cascade,
  updated_by uuid not null references users(id),
  status text not null,
  note text,
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── PROJECTS ────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  department_id uuid references departments(id),
  budget numeric(18,2),
  spent_amount numeric(18,2) default 0,
  currency text default 'INR',
  start_date date,
  end_date date,
  status text default 'Planning' check (status in (
    'Planning','In Progress','On Hold','Completed','Cancelled'
  )),
  completion_percentage integer default 0,
  is_public boolean default false,
  milestones jsonb default '[]',
  blockchain_tx_id text,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── FUND ALLOCATIONS ────────────────────────────────────────
create table if not exists fund_allocations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id),
  department_id uuid references departments(id),
  amount numeric(18,2) not null,
  vendor_name text,
  invoice_number text,
  gst_number text,
  description text,
  status text default 'Pending' check (status in (
    'Pending','Under Review','Approved','Disbursed','Flagged','Rejected'
  )),
  ai_risk_score integer,
  ai_flags jsonb default '[]',
  ai_recommendation text,
  ai_is_suspicious boolean default false,
  blockchain_tx_id text,
  created_by uuid references users(id),
  approved_by uuid references users(id),
  created_at timestamptz default now()
);

-- ── PULSE CHECKS (EnterpriseAI) ─────────────────────────────
create table if not exists pulse_checks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id),
  department_id uuid references departments(id),
  week_number integer,
  year integer,
  workload_score integer check (workload_score between 1 and 5),
  satisfaction_score integer check (satisfaction_score between 1 and 5),
  management_score integer check (management_score between 1 and 5),
  comment text,
  ai_themes jsonb,
  ai_sentiment text,
  created_at timestamptz default now()
);

-- ── MACHINE HEALTH (IndustrialAI) ───────────────────────────
create table if not exists machines (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  department_id uuid references departments(id),
  name text not null,
  model text,
  serial_number text,
  installation_date date,
  last_maintenance_date date,
  status text default 'Operational' check (status in (
    'Operational','At Risk','Under Maintenance','Breakdown','Decommissioned'
  )),
  health_score integer default 100 check (health_score between 0 and 100),
  total_downtime_hours numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table if not exists machine_health_logs (
  id uuid primary key default uuid_generate_v4(),
  machine_id uuid not null references machines(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  reported_by uuid references users(id),
  symptom_type text check (symptom_type in (
    'Unusual Noise','Vibration','Temperature','Output Quality',
    'Speed Drop','Oil Leak','Electrical','Other'
  )),
  severity text check (severity in ('Minor','Moderate','Severe')),
  description text,
  ai_failure_probability numeric(4,3),
  ai_predicted_failure_date date,
  ai_recommended_action text,
  is_resolved boolean default false,
  created_at timestamptz default now()
);

-- ── QUALITY GATES (IndustrialAI) ────────────────────────────
create table if not exists production_batches (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  batch_number text not null,
  product_name text not null,
  department_id uuid references departments(id),
  quantity numeric(12,2),
  unit text,
  start_time timestamptz,
  end_time timestamptz,
  status text default 'In Progress' check (status in (
    'In Progress','Passed','Failed','On Hold','Shipped'
  )),
  current_stage integer default 1,
  total_stages integer default 4,
  blockchain_tx_id text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table if not exists quality_gate_checks (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references production_batches(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  stage_number integer not null,
  stage_name text not null,
  parameter_name text,
  actual_value text,
  min_acceptable text,
  max_acceptable text,
  result text check (result in ('Pass','Fail','Hold')),
  checked_by uuid references users(id),
  ai_defect_probability numeric(4,3),
  ai_root_cause text,
  notes text,
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── SUPPLIERS (IndustrialAI) ─────────────────────────────────
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  contact_email text,
  contact_phone text,
  gstin text,
  material_category text,
  on_time_rate numeric(5,2) default 100,
  quality_pass_rate numeric(5,2) default 100,
  total_orders integer default 0,
  late_deliveries integer default 0,
  quality_failures integer default 0,
  ai_risk_level text check (ai_risk_level in ('Low','Medium','High','Critical')),
  ai_recommendation text,
  created_at timestamptz default now()
);

create table if not exists supplier_deliveries (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  po_number text,
  material_name text,
  quantity_ordered numeric(12,2),
  quantity_received numeric(12,2),
  expected_date date,
  actual_date date,
  quality_status text check (quality_status in ('Pending','Passed','Failed','Quarantined')),
  delay_days integer default 0,
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── SAFETY INCIDENTS (IndustrialAI) ─────────────────────────
create table if not exists safety_incidents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  reported_by uuid not null references users(id),
  department_id uuid references departments(id),
  incident_type text check (incident_type in (
    'Near Miss','Minor Injury','Serious Injury',
    'Fatality','Property Damage','Environmental','Unsafe Condition'
  )),
  severity text check (severity in ('Low','Medium','High','Critical')),
  title text not null,
  description text not null,
  location text,
  incident_time timestamptz,
  ai_root_causes jsonb,
  ai_corrective_actions jsonb,
  corrective_action_status text default 'Pending',
  corrective_action_due date,
  corrective_action_assigned_to uuid references users(id),
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── COMPLIANCE DEADLINES (Corp + Industry) ──────────────────
create table if not exists compliance_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  due_date date not null,
  status text default 'Pending' check (status in (
    'Pending','In Progress','Completed','Overdue','Waived'
  )),
  responsible_user_id uuid references users(id),
  document_url text,
  blockchain_tx_id text,
  reminder_sent_30 boolean default false,
  reminder_sent_15 boolean default false,
  reminder_sent_7 boolean default false,
  created_at timestamptz default now()
);

-- ── MEETING INTELLIGENCE (EnterpriseAI) ─────────────────────
create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  meeting_date timestamptz,
  transcript text,
  ai_summary text,
  ai_action_items jsonb default '[]',
  ai_effectiveness_score integer,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- ── FEEDBACK ────────────────────────────────────────────────
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  issue_id uuid references issues(id),
  submitted_by uuid references users(id),
  rating integer check (rating between 1 and 5),
  feedback_text text,
  ai_sentiment text,
  ai_sentiment_score numeric(4,3),
  ai_insight text,
  created_at timestamptz default now()
);

-- ── DOCUMENTS ───────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  file_url text,
  document_type text,
  description text,
  ai_summary text,
  ai_key_points jsonb,
  ai_deadlines jsonb,
  uploaded_by uuid references users(id),
  department_id uuid references departments(id),
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── AUDIT LOGS ──────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  blockchain_tx_id text,
  ip_address text,
  created_at timestamptz default now()
);

-- ── NOTIFICATIONS ───────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info','success','warning','error','security')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ── TRUST SCORES ────────────────────────────────────────────
create table if not exists trust_scores (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  department_id uuid references departments(id),
  score integer check (score between 0 and 100),
  previous_score integer,
  reasoning text,
  improvements jsonb,
  calculated_at timestamptz default now()
);

-- ── REFRESH TOKENS ──────────────────────────────────────────
create table if not exists refresh_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

insert into workspaces (id, name, type, description) values
  ('11111111-1111-1111-1111-111111111111','Chennai Municipal Corporation','government','Demo CivicAI workspace'),
  ('22222222-2222-2222-2222-222222222222','Infosys Limited','corporate','Demo EnterpriseAI workspace'),
  ('33333333-3333-3333-3333-333333333333','TVS Motor Company','industry','Demo IndustrialAI workspace')
on conflict do nothing;

insert into departments (workspace_id, name, description) values
  ('11111111-1111-1111-1111-111111111111','Public Works','Roads and infrastructure'),
  ('11111111-1111-1111-1111-111111111111','Water Supply','Water distribution'),
  ('11111111-1111-1111-1111-111111111111','Electricity','Power supply'),
  ('11111111-1111-1111-1111-111111111111','Healthcare','Public health'),
  ('11111111-1111-1111-1111-111111111111','Education','Schools and institutions'),
  ('11111111-1111-1111-1111-111111111111','Municipal Services','Garbage and parks'),
  ('22222222-2222-2222-2222-222222222222','Engineering','Software teams'),
  ('22222222-2222-2222-2222-222222222222','Human Resources','HR department'),
  ('22222222-2222-2222-2222-222222222222','Finance','Accounts and finance'),
  ('22222222-2222-2222-2222-222222222222','Operations','Business operations'),
  ('33333333-3333-3333-3333-333333333333','Production Plant A','Main manufacturing'),
  ('33333333-3333-3333-3333-333333333333','Quality Control','QC and inspection'),
  ('33333333-3333-3333-3333-333333333333','Supply Chain','Vendor management'),
  ('33333333-3333-3333-3333-333333333333','Safety','HSE department')
on conflict do nothing;

-- Password for all demo users: Admin@123
-- Hash: bcrypt of 'Admin@123' with 10 rounds
insert into users (workspace_id, name, email, phone, password_hash, role) values
  ('11111111-1111-1111-1111-111111111111','CivicAI Admin','admin@civicai.in','9000000001','$2a$10$S7slw5l/cFWDUdoDZinOzehXcFidOuA/fo1tOqnLV78kDHdim4XvO','admin'),
  ('22222222-2222-2222-2222-222222222222','EnterpriseAI Admin','admin@enterpriseai.in','9000000002','$2a$10$S7slw5l/cFWDUdoDZinOzehXcFidOuA/fo1tOqnLV78kDHdim4XvO','admin'),
  ('33333333-3333-3333-3333-333333333333','IndustrialAI Admin','admin@industrialai.in','9000000003','$2a$10$S7slw5l/cFWDUdoDZinOzehXcFidOuA/fo1tOqnLV78kDHdim4XvO','admin')
on conflict do nothing;


insert into machines (workspace_id, name, model, status, health_score) values
  ('33333333-3333-3333-3333-333333333333','CNC Machine 1','FANUC 30i','Operational',82),
  ('33333333-3333-3333-3333-333333333333','Press Machine 2','AIDA 800T','At Risk',54),
  ('33333333-3333-3333-3333-333333333333','Conveyor Line A','Dorner 2200','Operational',91),
  ('33333333-3333-3333-3333-333333333333','Injection Molder 3','Haitian MA2700','Operational',73)
on conflict do nothing;

insert into suppliers (workspace_id, name, contact_email, material_category, on_time_rate, quality_pass_rate) values
  ('33333333-3333-3333-3333-333333333333','Steel India Ltd','contact@steelindia.com','Raw Steel',67,88),
  ('33333333-3333-3333-3333-333333333333','PolyMart Chemicals','info@polymart.in','Polymer Compounds',91,95),
  ('33333333-3333-3333-3333-333333333333','FastBolt Components','sales@fastbolt.com','Fasteners',45,72)
on conflict do nothing;
