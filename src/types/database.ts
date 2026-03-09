// ═══════════════════════════════════════════════════════════════════════════
// NatIQ Database Types
// ═══════════════════════════════════════════════════════════════════════════

export type ComplianceStatus = 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' | 'UNKNOWN';
export type ComplianceBand = 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_LOW' | 'GREEN' | 'YELLOW' | 'RED';
export type Country = 'SA' | 'AE' | 'QA' | 'OM';
export type Priority = 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ActionType = 'HIRE_NATIONAL' | 'RECLASSIFY' | 'REVIEW_CONTRACTS' | 'OTHER';
export type RecommendationStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'DISMISSED';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationType = 'COMPLIANCE_ALERT' | 'REGULATORY_CHANGE' | 'FORECAST_RISK' | 'SYSTEM';
export type UserRole = 'admin' | 'hr_director' | 'hr_manager' | 'cfo' | 'viewer';
export type PlanType = 'starter' | 'growth' | 'scale' | 'enterprise';
export type ContractType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ChangeType = 'TARGET_INCREASE' | 'NEW_REGULATION' | 'FINE_CHANGE' | 'SECTOR_RECLASSIFICATION';

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  plan: PlanType;
  created_at: string;
}

export interface Entity {
  id: string;
  company_id: string;
  name: string;
  country: Country;
  legal_type: string | null;
  registration_number: string | null;
  industry_sector: string | null;
  employee_count_band: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  entity_id: string;
  full_name: string;
  nationality: string;
  is_national: boolean;
  job_title: string | null;
  department: string | null;
  contract_type: ContractType;
  counts_toward_quota: boolean;
  start_date: string | null;
  end_date: string | null;
  salary_band: string | null;
  created_at: string;
}

export interface ComplianceRule {
  id: string;
  country: Country;
  program_name: string;
  industry_sector: string | null;
  company_size_min: number | null;
  company_size_max: number | null;
  target_percentage: number;
  band_green_min: number | null;
  band_platinum_min: number | null;
  band_yellow_min: number | null;
  effective_from: string;
  effective_to: string | null;
  source_url: string | null;
  notes: string | null;
}

export interface ComplianceScore {
  id: string;
  entity_id: string;
  rule_id: string | null;
  calculated_at: string;
  national_count: number;
  total_count: number;
  ratio: number;
  band: ComplianceBand | null;
  status: ComplianceStatus;
}

export interface Forecast {
  id: string;
  entity_id: string;
  generated_at: string;
  horizon_days: number;
  projected_ratio_30d: number | null;
  projected_ratio_60d: number | null;
  projected_ratio_90d: number | null;
  risk_date: string | null;
  confidence: ConfidenceLevel | null;
  scenario_inputs: Record<string, number> | null;
}

export interface Recommendation {
  id: string;
  entity_id: string;
  priority: Priority;
  title: string;
  description: string | null;
  impact_score: number | null;
  effort_level: EffortLevel | null;
  compliance_gain: number | null;
  action_type: ActionType | null;
  status: RecommendationStatus;
  created_at: string;
}

export interface RegulatoryChange {
  id: string;
  country: Country;
  program: string;
  detected_at: string;
  effective_date: string | null;
  headline: string;
  summary: string | null;
  impact_level: ImpactLevel | null;
  source_url: string | null;
  affects_sectors: string[] | null;
  change_type: ChangeType | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  company_id: string | null;
  full_name: string | null;
  role: UserRole;
  language_pref: 'en' | 'ar';
  notification_email: boolean;
  notification_in_app: boolean;
  created_at: string;
}

// ─── Extended Types ─────────────────────────────────────────────────────────

export interface EntityWithScore extends Entity {
  currentScore?: ComplianceScore;
}

export interface ScoreDetails {
  ratio: number;
  status: ComplianceStatus;
  band: string;
  national_count: number;
  total_count: number;
  quota_gap: number;
  target: number;
  program: string;
  trend: number;
  nationals_full_time: number;
  nationals_part_time: number;
  nationals_contract: number;
  qualifying_nationals: number;
  qualifying_total: number;
}

export interface DashboardData {
  entity: Entity;
  score: ScoreDetails;
  compliance_history: Array<{ month: string; ratio: number; target: number }>;
  department_breakdown: Array<{ dept: string; nationals: number; expats: number; total: number; ratio: number }>;
}

export interface ForecastData {
  entity_id: string;
  target: number;
  data: Array<{ date: string; historical?: number; projected?: number; isToday?: boolean; isHistory?: boolean }>;
  projected_30d: number;
  projected_60d: number;
  projected_90d: number;
  risk_date: string | null;
  confidence: ConfidenceLevel;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  last_active: string;
}
