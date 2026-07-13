-- Run this in Supabase SQL Editor → New Query → Run All
-- This creates all tables and seeds demo data for TrustGov AI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  role text not null default 'citizen' check (role in ('citizen', 'officer', 'department_head', 'admin')),
  department_id uuid,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── DEPARTMENTS ─────────────────────────────────────────────────
create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  head_user_id uuid,
  created_at timestamptz default now()
);

-- ── COMPLAINTS ──────────────────────────────────────────────────
create table if not exists complaints (
  id uuid primary key default uuid_generate_v4(),
  citizen_id uuid not null references users(id),
  title text not null,
  description text not null,
  category text not null default 'Other',
  priority text default 'Medium' check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status text default 'Submitted' check (status in ('Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  department_id uuid references departments(id),
  assigned_officer_id uuid references users(id),
  ai_category text,
  ai_priority text,
  ai_summary text,
  ai_estimated_days integer,
  blockchain_tx_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── COMPLAINT UPDATES ───────────────────────────────────────────
create table if not exists complaint_updates (
  id uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  updated_by uuid not null references users(id),
  status text not null,
  note text,
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── PROJECTS ────────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  department_id uuid references departments(id),
  description text,
  budget numeric(15,2),
  start_date date,
  end_date date,
  status text default 'Planning' check (status in ('Planning', 'In Progress', 'Completed', 'On Hold')),
  completion_percentage integer default 0 check (completion_percentage between 0 and 100),
  blockchain_tx_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── FUND ALLOCATIONS ────────────────────────────────────────────
create table if not exists fund_allocations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  department_id uuid references departments(id),
  amount numeric(15,2) not null,
  vendor text,
  description text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Disbursed', 'Flagged')),
  ai_risk_score integer,
  ai_flags jsonb,
  ai_recommendation text,
  blockchain_tx_id text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- ── DOCUMENTS ───────────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  file_url text,
  document_type text,
  uploaded_by uuid references users(id),
  department_id uuid references departments(id),
  blockchain_tx_id text,
  created_at timestamptz default now()
);

-- ── AUDIT LOGS ──────────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  blockchain_tx_id text,
  ip_address text,
  created_at timestamptz default now()
);

-- ── NOTIFICATIONS ───────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  title text not null,
  message text not null,
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ── FEEDBACK ────────────────────────────────────────────────────
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  complaint_id uuid references complaints(id),
  citizen_id uuid references users(id),
  rating integer check (rating between 1 and 5),
  feedback_text text,
  ai_sentiment text,
  ai_sentiment_score numeric(4,3),
  ai_insight text,
  created_at timestamptz default now()
);

-- ── REFRESH TOKENS ──────────────────────────────────────────────
create table if not exists refresh_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ── SEED: Default departments ───────────────────────────────────
insert into departments (name, description) values
  ('Public Works', 'Roads, bridges, infrastructure'),
  ('Water Supply', 'Water distribution and sanitation'),
  ('Electricity', 'Power supply and maintenance'),
  ('Healthcare', 'Public health services'),
  ('Education', 'Schools and educational institutions'),
  ('Municipal Services', 'Garbage, parks, street lighting'),
  ('Transportation', 'Public transport and traffic'),
  ('Land Records', 'Property and land documentation'),
  ('Finance', 'Budget, allocations, procurement')
on conflict do nothing;

-- ── SEED: Demo admin user ────────────────────────────────────────
-- Password: Admin@123 — bcrypt hash with 10 rounds
insert into users (name, email, phone, password_hash, role) values
  ('System Admin', 'admin@trustgov.in', '9000000000',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin')
on conflict (email) do nothing;

-- ── SEED: Demo citizen user ──────────────────────────────────────
-- Password: Demo@123
insert into users (name, email, phone, password_hash, role) values
  ('Demo Citizen', 'demo@trustgov.in', '8939687210',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'citizen')
on conflict (email) do nothing;
