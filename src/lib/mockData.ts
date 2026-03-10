// ═══════════════════════════════════════════════════════════════════════════
// NatIQ Mock Data for Demo
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Entity,
  Recommendation,
  RegulatoryChange,
  Notification,
  Employee,
  DashboardData,
  ForecastData,
  TeamMember,
  Country,
} from '@/types/database';

// ─── Company ─────────────────────────────────────────────────────────────────

export const MOCK_COMPANY = {
  id: 'demo-company',
  name: 'Acme Gulf Holdings',
  industry: 'Technology',
  plan: 'growth' as const,
  created_at: '2024-01-01T00:00:00Z',
};

// ─── Country Constants ─────────────────────────────────────────────────────────

export const COUNTRY_FLAGS: Record<Country, string> = {
  SA: '🇸🇦',
  AE: '🇦🇪',
  QA: '🇶🇦',
  OM: '🇴🇲',
};

export const COUNTRY_NAMES: Record<Country, string> = {
  SA: 'Saudi Arabia',
  AE: 'UAE',
  QA: 'Qatar',
  OM: 'Oman',
};

export const PROGRAM_NAMES: Record<Country, string> = {
  SA: 'Nitaqat',
  AE: 'Emiratisation',
  QA: 'Qatarisation',
  OM: 'Omanisation',
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export const MOCK_ENTITIES: Entity[] = [
  {
    id: 'entity-sa',
    company_id: 'demo-company',
    name: 'Acme Saudi Arabia LLC',
    country: 'SA',
    legal_type: 'LLC',
    registration_number: '1010XXXXXX',
    industry_sector: 'Technology',
    employee_count_band: '200-499',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'entity-ae',
    company_id: 'demo-company',
    name: 'Acme UAE FZE',
    country: 'AE',
    legal_type: 'FZE',
    registration_number: 'DAFZ-XXXXX',
    industry_sector: 'Technology',
    employee_count_band: '50-199',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ─── Dashboard Data ─────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_DATA: Record<string, DashboardData> = {
  'entity-sa': {
    entity: MOCK_ENTITIES[0],
    score: {
      ratio: 21.4,
      status: 'COMPLIANT',
      band: 'GREEN',
      national_count: 43,
      total_count: 201,
      quota_gap: 0,
      target: 15.0,
      program: 'Nitaqat',
      trend: 1.2,
      nationals_full_time: 35,
      nationals_part_time: 8,
      nationals_contract: 4,
      qualifying_nationals: 43,
      qualifying_total: 201,
    },
    compliance_history: [
      { month: 'Aug', ratio: 18.2, target: 15.0 },
      { month: 'Sep', ratio: 19.1, target: 15.0 },
      { month: 'Oct', ratio: 19.8, target: 15.0 },
      { month: 'Nov', ratio: 20.3, target: 15.0 },
      { month: 'Dec', ratio: 20.9, target: 15.0 },
      { month: 'Jan', ratio: 21.4, target: 15.0 },
    ],
    department_breakdown: [
      { dept: 'Engineering', nationals: 12, expats: 33, total: 45, ratio: 26.7 },
      { dept: 'Sales', nationals: 8, expats: 20, total: 28, ratio: 28.6 },
      { dept: 'Finance', nationals: 2, expats: 16, total: 18, ratio: 11.1 },
      { dept: 'Operations', nationals: 12, expats: 40, total: 52, ratio: 23.1 },
      { dept: 'HR', nationals: 5, expats: 7, total: 12, ratio: 41.7 },
      { dept: 'Marketing', nationals: 4, expats: 16, total: 20, ratio: 20.0 },
      { dept: 'Management', nationals: 0, expats: 26, total: 26, ratio: 0.0 },
    ],
  },
  'entity-ae': {
    entity: MOCK_ENTITIES[1],
    score: {
      ratio: 8.2,
      status: 'AT_RISK',
      band: 'YELLOW',
      national_count: 7,
      total_count: 85,
      quota_gap: 2,
      target: 10.0,
      program: 'Emiratisation',
      trend: -0.5,
      nationals_full_time: 6,
      nationals_part_time: 1,
      nationals_contract: 0,
      qualifying_nationals: 7,
      qualifying_total: 85,
    },
    compliance_history: [
      { month: 'Aug', ratio: 10.5, target: 10.0 },
      { month: 'Sep', ratio: 10.2, target: 10.0 },
      { month: 'Oct', ratio: 9.8, target: 10.0 },
      { month: 'Nov', ratio: 9.4, target: 10.0 },
      { month: 'Dec', ratio: 8.8, target: 10.0 },
      { month: 'Jan', ratio: 8.2, target: 10.0 },
    ],
    department_breakdown: [
      { dept: 'Engineering', nationals: 2, expats: 28, total: 30, ratio: 6.7 },
      { dept: 'Sales', nationals: 3, expats: 22, total: 25, ratio: 12.0 },
      { dept: 'Finance', nationals: 1, expats: 14, total: 15, ratio: 6.7 },
      { dept: 'Operations', nationals: 1, expats: 14, total: 15, ratio: 6.7 },
    ],
  },
};

// ─── Forecast Data ─────────────────────────────────────────────────────────

export const MOCK_FORECAST_DATA: Record<string, ForecastData> = {
  'entity-sa': {
    entity_id: 'entity-sa',
    target: 15.0,
    data: [
      { date: 'Dec 10', historical: 20.6, isHistory: true },
      { date: 'Dec 15', historical: 20.8, isHistory: true },
      { date: 'Dec 20', historical: 21.0, isHistory: true },
      { date: 'Dec 25', historical: 21.2, isHistory: true },
      { date: 'Dec 30', historical: 21.3, isHistory: true },
      { date: 'Jan 5', historical: 21.4, isHistory: true },
      { date: 'Jan 9', historical: 21.4, projected: 21.4, isToday: true },
      { date: 'Jan 20', projected: 21.6 },
      { date: 'Feb 1', projected: 21.9 },
      { date: 'Feb 15', projected: 22.1 },
      { date: 'Mar 1', projected: 22.3 },
      { date: 'Mar 15', projected: 22.5 },
      { date: 'Apr 9', projected: 22.8 },
    ],
    projected_30d: 21.9,
    projected_60d: 22.3,
    projected_90d: 22.8,
    risk_date: null,
    confidence: 'HIGH',
  },
  'entity-ae': {
    entity_id: 'entity-ae',
    target: 10.0,
    data: [
      { date: 'Dec 10', historical: 9.2, isHistory: true },
      { date: 'Dec 15', historical: 9.0, isHistory: true },
      { date: 'Dec 20', historical: 8.8, isHistory: true },
      { date: 'Dec 25', historical: 8.6, isHistory: true },
      { date: 'Dec 30', historical: 8.4, isHistory: true },
      { date: 'Jan 5', historical: 8.3, isHistory: true },
      { date: 'Jan 9', historical: 8.2, projected: 8.2, isToday: true },
      { date: 'Jan 20', projected: 8.0 },
      { date: 'Feb 1', projected: 7.8 },
      { date: 'Feb 15', projected: 7.6 },
      { date: 'Mar 1', projected: 7.3 },
      { date: 'Mar 15', projected: 7.1 },
      { date: 'Apr 9', projected: 6.9 },
    ],
    projected_30d: 7.9,
    projected_60d: 7.6,
    projected_90d: 7.2,
    risk_date: '2025-02-15',
    confidence: 'MEDIUM',
  },
};

// ─── Recommendations ─────────────────────────────────────────────────────────

export const MOCK_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  'entity-sa': [
    {
      id: 'rec-1',
      entity_id: 'entity-sa',
      priority: 'CRITICAL',
      title: 'Hire 2 Saudi nationals in Finance department',
      description: 'Adding 2 qualifying Saudi national employees to Finance would raise your overall compliance ratio by +1.8%, moving you solidly into Green band with more buffer.',
      impact_score: 90,
      effort_level: 'LOW',
      compliance_gain: 1.8,
      action_type: 'HIRE_NATIONAL',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-2',
      entity_id: 'entity-sa',
      priority: 'CRITICAL',
      title: 'Reclassify 3 part-time Saudi staff to full-time',
      description: 'Converting 3 currently part-time Saudi nationals to full-time contracts will improve their quota weighting, adding +1.2% to your compliance ratio.',
      impact_score: 85,
      effort_level: 'LOW',
      compliance_gain: 1.2,
      action_type: 'RECLASSIFY',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-3',
      entity_id: 'entity-sa',
      priority: 'IMPORTANT',
      title: 'Review 5 contractor agreements ending this quarter',
      description: 'Five contractor agreements expire this quarter. Reviewing and converting qualifying Saudi nationals to full-time employment could add +0.8% to your ratio.',
      impact_score: 70,
      effort_level: 'MEDIUM',
      compliance_gain: 0.8,
      action_type: 'REVIEW_CONTRACTS',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-4',
      entity_id: 'entity-sa',
      priority: 'IMPORTANT',
      title: 'Post 2 Saudi national positions in Operations',
      description: 'Operations is your largest department with a 23.1% ratio. Posting 2 targeted roles could increase overall compliance by +1.5% while strengthening a key department.',
      impact_score: 75,
      effort_level: 'LOW',
      compliance_gain: 1.5,
      action_type: 'HIRE_NATIONAL',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-5',
      entity_id: 'entity-sa',
      priority: 'OPTIONAL',
      title: 'Enroll eligible Saudi staff in Qiwa training programmes',
      description: 'Enrolling eligible employees in certified Qiwa development programmes demonstrates commitment to Saudisation and may qualify for accelerated recalculation.',
      impact_score: 30,
      effort_level: 'HIGH',
      compliance_gain: 0.1,
      action_type: 'OTHER',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-6',
      entity_id: 'entity-sa',
      priority: 'OPTIONAL',
      title: 'Review nationality classification of 4 GCC national employees',
      description: 'Four employees classified as GCC nationals may qualify under specific Nitaqat provisions. Reviewing their classification could add +0.6% to your overall ratio.',
      impact_score: 40,
      effort_level: 'MEDIUM',
      compliance_gain: 0.6,
      action_type: 'OTHER',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
  ],
  'entity-ae': [
    {
      id: 'rec-ae-1',
      entity_id: 'entity-ae',
      priority: 'CRITICAL',
      title: 'Hire 3 UAE nationals to reach Emiratisation minimum of 10%',
      description: 'Your current ratio of 8.2% is below the 10% Emiratisation minimum. Hiring 3 qualified UAE nationals immediately would bring you to compliance and prevent potential fines.',
      impact_score: 95,
      effort_level: 'LOW',
      compliance_gain: 3.5,
      action_type: 'HIRE_NATIONAL',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
    {
      id: 'rec-ae-2',
      entity_id: 'entity-ae',
      priority: 'IMPORTANT',
      title: 'Review part-time UAE nationals for full-time conversion',
      description: 'One part-time UAE national could be converted to full-time, improving their quota contribution and adding +1.0% to your ratio.',
      impact_score: 65,
      effort_level: 'LOW',
      compliance_gain: 1.0,
      action_type: 'RECLASSIFY',
      status: 'OPEN',
      created_at: '2025-01-09T00:00:00Z',
    },
  ],
};

// ─── Regulatory Changes ─────────────────────────────────────────────────────

export const MOCK_REGULATORY_CHANGES: RegulatoryChange[] = [
  {
    id: 'reg-1',
    country: 'SA',
    program: 'Nitaqat',
    detected_at: '2024-01-10T00:00:00Z',
    effective_date: '2024-01-01',
    headline: 'Nitaqat target raised for Hospitality sector from 15% to 18%',
    summary: 'MHRSD has updated Nitaqat targets for the hospitality and tourism sector as part of Vision 2030 nationalisation push. New target effective Q1 2024.',
    impact_level: 'HIGH',
    source_url: 'https://qiwa.sa',
    affects_sectors: ['Hospitality'],
    change_type: 'TARGET_INCREASE',
  },
  {
    id: 'reg-2',
    country: 'AE',
    program: 'Emiratisation',
    detected_at: '2024-11-15T00:00:00Z',
    effective_date: '2025-01-01',
    headline: 'Nafis 2% annual increment confirmed for 2025',
    summary: 'MOHRE has confirmed the Emiratisation target will increase by 2% in January 2025, bringing the overall target to 10% for private sector companies with 50+ employees.',
    impact_level: 'HIGH',
    source_url: 'https://nafis.gov.ae',
    affects_sectors: null,
    change_type: 'TARGET_INCREASE',
  },
  {
    id: 'reg-3',
    country: 'AE',
    program: 'Emiratisation',
    detected_at: '2024-05-20T00:00:00Z',
    effective_date: '2024-06-01',
    headline: 'Nafis salary subsidy increased to AED 9,000/month',
    summary: 'The government has increased the monthly salary subsidy for each Emirati hire from AED 8,000 to AED 9,000, effective immediately.',
    impact_level: 'MEDIUM',
    source_url: 'https://nafis.gov.ae',
    affects_sectors: null,
    change_type: 'NEW_REGULATION',
  },
  {
    id: 'reg-4',
    country: 'QA',
    program: 'Qatarisation',
    detected_at: '2024-02-28T00:00:00Z',
    effective_date: '2024-03-01',
    headline: 'New online Qatarisation reporting portal launched',
    summary: 'The Ministry of Labour has launched a new digital portal for submitting quarterly Qatarisation compliance reports, replacing the previous paper-based process.',
    impact_level: 'LOW',
    source_url: 'https://adlsa.gov.qa',
    affects_sectors: null,
    change_type: 'NEW_REGULATION',
  },
];

// ─── Notifications ─────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'demo-user',
    type: 'COMPLIANCE_ALERT',
    title: 'UAE entity below minimum compliance',
    body: 'Your UAE entity (Acme UAE FZE) ratio dropped to 8.2% — below the 10% Emiratisation minimum. Immediate action required.',
    read: false,
    action_url: '/recommendations',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'demo-user',
    type: 'REGULATORY_CHANGE',
    title: 'New Nitaqat change affecting Hospitality sector',
    body: 'Nitaqat target raised for Hospitality sector from 15% to 18%. Review your compliance position.',
    read: false,
    action_url: '/regulatory',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'demo-user',
    type: 'FORECAST_RISK',
    title: 'UAE entity forecast: breach risk in 34 days',
    body: 'At current trajectory, Acme UAE FZE may breach the Emiratisation minimum in approximately 34 days. View recommendations.',
    read: false,
    action_url: '/forecast',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'demo-user',
    type: 'SYSTEM',
    title: '147 employees successfully imported',
    body: 'CSV import completed. 147 employees have been successfully added to Acme Saudi Arabia LLC.',
    read: true,
    action_url: '/employees',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    user_id: 'demo-user',
    type: 'REGULATORY_CHANGE',
    title: 'Nafis salary subsidy increased to AED 9,000/month',
    body: 'The UAE government increased the Emiratisation salary subsidy from AED 8,000 to AED 9,000 per month.',
    read: true,
    action_url: '/regulatory',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Employees ─────────────────────────────────────────────────────────────

export const MOCK_EMPLOYEES: Record<string, Employee[]> = {
  'entity-sa': [
    { id: 'emp-1', entity_id: 'entity-sa', full_name: 'Mohammed Al-Zahrani', nationality: 'SA', is_national: true, job_title: 'Senior Software Engineer', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2022-03-15', end_date: null, salary_band: 'Senior', created_at: '2022-03-15T00:00:00Z' },
    { id: 'emp-2', entity_id: 'entity-sa', full_name: 'Ahmed Al-Otaibi', nationality: 'SA', is_national: true, job_title: 'Finance Analyst', department: 'Finance', contract_type: 'full_time', counts_toward_quota: true, start_date: '2023-01-10', end_date: null, salary_band: 'Mid', created_at: '2023-01-10T00:00:00Z' },
    { id: 'emp-3', entity_id: 'entity-sa', full_name: 'Sarah Al-Qahtani', nationality: 'SA', is_national: true, job_title: 'HR Business Partner', department: 'HR', contract_type: 'full_time', counts_toward_quota: true, start_date: '2021-07-20', end_date: null, salary_band: 'Mid', created_at: '2021-07-20T00:00:00Z' },
    { id: 'emp-4', entity_id: 'entity-sa', full_name: 'Rajesh Kumar', nationality: 'IN', is_national: false, job_title: 'Principal Engineer', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2020-09-01', end_date: null, salary_band: 'Senior', created_at: '2020-09-01T00:00:00Z' },
    { id: 'emp-5', entity_id: 'entity-sa', full_name: 'Priya Sharma', nationality: 'IN', is_national: false, job_title: 'Product Manager', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2021-11-15', end_date: null, salary_band: 'Senior', created_at: '2021-11-15T00:00:00Z' },
    { id: 'emp-6', entity_id: 'entity-sa', full_name: 'Nour Al-Rashidi', nationality: 'SA', is_national: true, job_title: 'Operations Manager', department: 'Operations', contract_type: 'full_time', counts_toward_quota: true, start_date: '2019-04-01', end_date: null, salary_band: 'Management', created_at: '2019-04-01T00:00:00Z' },
    { id: 'emp-7', entity_id: 'entity-sa', full_name: 'Ahmed Hassan', nationality: 'EG', is_national: false, job_title: 'Backend Developer', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2023-06-01', end_date: null, salary_band: 'Mid', created_at: '2023-06-01T00:00:00Z' },
    { id: 'emp-8', entity_id: 'entity-sa', full_name: 'Fatima Al-Ghamdi', nationality: 'SA', is_national: true, job_title: 'Sales Executive', department: 'Sales', contract_type: 'part_time', counts_toward_quota: true, start_date: '2023-09-15', end_date: null, salary_band: 'Junior', created_at: '2023-09-15T00:00:00Z' },
    { id: 'emp-9', entity_id: 'entity-sa', full_name: 'James Wright', nationality: 'GB', is_national: false, job_title: 'CTO', department: 'Management', contract_type: 'full_time', counts_toward_quota: true, start_date: '2018-01-10', end_date: null, salary_band: 'Executive', created_at: '2018-01-10T00:00:00Z' },
    { id: 'emp-10', entity_id: 'entity-sa', full_name: 'Omar Al-Balawi', nationality: 'SA', is_national: true, job_title: 'Marketing Specialist', department: 'Marketing', contract_type: 'full_time', counts_toward_quota: true, start_date: '2022-08-01', end_date: null, salary_band: 'Junior', created_at: '2022-08-01T00:00:00Z' },
  ],
  'entity-ae': [
    { id: 'emp-ae-1', entity_id: 'entity-ae', full_name: 'Fatima Al-Hashmi', nationality: 'AE', is_national: true, job_title: 'Business Development Manager', department: 'Sales', contract_type: 'full_time', counts_toward_quota: true, start_date: '2022-01-15', end_date: null, salary_band: 'Senior', created_at: '2022-01-15T00:00:00Z' },
    { id: 'emp-ae-2', entity_id: 'entity-ae', full_name: 'Omar Al-Shamsi', nationality: 'AE', is_national: true, job_title: 'Finance Manager', department: 'Finance', contract_type: 'full_time', counts_toward_quota: true, start_date: '2021-06-01', end_date: null, salary_band: 'Management', created_at: '2021-06-01T00:00:00Z' },
    { id: 'emp-ae-3', entity_id: 'entity-ae', full_name: 'Rahul Mehta', nationality: 'IN', is_national: false, job_title: 'Software Engineer', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2023-03-01', end_date: null, salary_band: 'Mid', created_at: '2023-03-01T00:00:00Z' },
    { id: 'emp-ae-4', entity_id: 'entity-ae', full_name: 'Suresh Patel', nationality: 'IN', is_national: false, job_title: 'DevOps Engineer', department: 'Engineering', contract_type: 'full_time', counts_toward_quota: true, start_date: '2022-11-01', end_date: null, salary_band: 'Mid', created_at: '2022-11-01T00:00:00Z' },
    { id: 'emp-ae-5', entity_id: 'entity-ae', full_name: 'Sara Al-Mansoori', nationality: 'AE', is_national: true, job_title: 'HR Coordinator', department: 'Operations', contract_type: 'part_time', counts_toward_quota: true, start_date: '2023-10-01', end_date: null, salary_band: 'Junior', created_at: '2023-10-01T00:00:00Z' },
  ],
};

// ─── Team Members ─────────────────────────────────────────────────────────

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'user-1', full_name: 'Khalid Al-Mansour', email: 'khalid@acmegulf.com', role: 'hr_director', last_active: '2025-01-09' },
  { id: 'user-2', full_name: 'Jennifer Smith', email: 'jennifer@acmegulf.com', role: 'hr_manager', last_active: '2025-01-08' },
  { id: 'user-3', full_name: 'David Chen', email: 'david@acmegulf.com', role: 'cfo', last_active: '2025-01-07' },
  { id: 'user-4', full_name: 'Aisha Al-Rashidi', email: 'aisha@acmegulf.com', role: 'viewer', last_active: '2025-01-06' },
];

// ─── Chart Colors ─────────────────────────────────────────────────────────

export const CHART_COLORS = {
  teal: '#0E7C7B',
  navy: '#1B3A5C',
  amber: '#D97706',
  red: '#DC2626',
  green: '#059669',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  tealLight: '#E6F4F4',
  redLight: '#FEE2E2',
  greenLight: '#D1FAE5',
  amberLight: '#FEF3C7',
};

// ─── Helper Functions ─────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function getNationalityFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const codePoints = [...code.toUpperCase()].map(
    (c) => 0x1f1e6 - 65 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

export const INDUSTRY_SECTORS = [
  'Technology',
  'Hospitality',
  'Retail',
  'Construction',
  'Oil & Gas',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Transportation',
  'Education',
];

export const EMPLOYEE_COUNT_BANDS = [
  '1-5',
  '6-49',
  '50-99',
  '100-499',
  '500+',
];

export const SALARY_BANDS = [
  'Junior',
  'Mid',
  'Senior',
  'Management',
  'Executive',
];
