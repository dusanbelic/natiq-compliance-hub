import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useEntity } from '@/contexts/EntityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  COUNTRY_FLAGS,
  MOCK_RECOMMENDATIONS,
  MOCK_REGULATORY_CHANGES,
  MOCK_FORECAST_DATA,
  formatNumber,
  formatPercent,
  CHART_COLORS,
} from '@/lib/mockData';
import { useRecommendations, useRegulatoryChanges, useForecasts } from '@/hooks/use-supabase-data';
import { ComplianceRing } from '@/components/ComplianceRing';
import { StatusBadge, BandBadge } from '@/components/StatusBadge';
import { SimpleComplianceBar } from '@/components/ComplianceBandBar';
import { PriorityBadge, ComplianceGainChip } from '@/components/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Target,
  AlertTriangle,
  ArrowRight,
  Radio,
  Lightbulb,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { ShareComplianceModal } from '@/components/dashboard/ShareComplianceModal';
import type { ComplianceStatus } from '@/types/database';

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedEntity, dashboardData, entities, loading, allScores } = useEntity();
  const { isDemoMode, profile } = useAuth();
  const { t } = useLanguage();
  const { score, compliance_history, department_breakdown } = dashboardData;

  // Check if user is a design partner
  const [isPartner, setIsPartner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem('partner_banner_dismissed') === 'true');

  // Check partner status on mount
  useState(() => {
    if (profile?.company_id && !isDemoMode) {
      supabase.from('companies').select('plan').eq('id', profile.company_id).single().then(({ data }) => {
        if (data?.plan === 'design_partner' as any) setIsPartner(true);
      });
    }
  });

  // Live data hooks (disabled in demo mode via the hooks themselves)
  const { data: liveRecommendations } = useRecommendations(selectedEntity?.id);
  const { data: liveRegChanges } = useRegulatoryChanges();
  const { data: liveForecast } = useForecasts(selectedEntity?.id);

  // Choose between live and mock data
  const recommendations = isDemoMode
    ? (MOCK_RECOMMENDATIONS[selectedEntity?.id] || [])
    : (liveRecommendations || []);
  const topRecommendations = recommendations.slice(0, 3);

  const recentRegChanges = isDemoMode
    ? MOCK_REGULATORY_CHANGES.slice(0, 3)
    : (liveRegChanges || []).slice(0, 3);

  const forecastData = isDemoMode
    ? MOCK_FORECAST_DATA[selectedEntity?.id]
    : liveForecast
      ? {
          entity_id: liveForecast.entity_id,
          target: score.target,
          data: [],
          projected_30d: Number(liveForecast.projected_ratio_30d) || 0,
          projected_60d: Number(liveForecast.projected_ratio_60d) || 0,
          projected_90d: Number(liveForecast.projected_ratio_90d) || 0,
          risk_date: liveForecast.risk_date,
          confidence: (liveForecast.confidence as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
        }
      : null;

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const trendIcon = score.trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = score.trend >= 0 ? 'text-status-green' : 'text-status-red';
  const isCompliant = score.status === 'COMPLIANT';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="lg:col-span-3 h-80" />
          <Skeleton className="lg:col-span-2 h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zone A: Status Bar */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {/* Compliance Ratio */}
            <button
              onClick={() => navigate('/compliance')}
              className="p-4 lg:p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{t('Compliance Ratio')}</p>
              <div className="flex items-center gap-2">
                <span className="font-jetbrains font-bold text-2xl lg:text-3xl">
                  {formatPercent(score.ratio)}
                </span>
                <StatusBadge status={score.status} size="sm" />
              </div>
              <div className={cn('flex items-center gap-1 text-sm mt-1', trendColor)}>
                {score.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-jetbrains">{score.trend >= 0 ? '+' : ''}{score.trend.toFixed(1)}%</span>
                <span className="text-muted-foreground">last 30d</span>
              </div>
            </button>

            {/* Nationals */}
            <button
              onClick={() => navigate('/employees?filter=nationals')}
              className="p-4 lg:p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{t('National Employees')}</p>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span className="font-jetbrains font-bold text-2xl lg:text-3xl">
                  {formatNumber(score.national_count)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {score.qualifying_nationals} qualifying
              </p>
            </button>

            {/* Total Headcount */}
            <button
              onClick={() => navigate('/employees')}
              className="p-4 lg:p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{t('Total Employees')}</p>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span className="font-jetbrains font-bold text-2xl lg:text-3xl">
                  {formatNumber(score.total_count)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {score.qualifying_total} qualifying
              </p>
            </button>

            {/* Quota Gap */}
            <button
              onClick={() => navigate('/recommendations')}
              className="p-4 lg:p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{t('Quota Gap to Fill')}</p>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber" />
                <span className="font-jetbrains font-bold text-2xl lg:text-3xl">
                  {score.quota_gap}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {score.quota_gap === 0 ? 'Already compliant' : 'Nationals needed'}
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Zone B: Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Compliance Score Card */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-sora text-lg">
                {t('Overall Compliance Status')} — {COUNTRY_FLAGS[selectedEntity.country]} {selectedEntity.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {isCompliant && (
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShareModalOpen(true)} title="Share achievement">
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('Recalculate')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Ring */}
                <div className="flex flex-col items-center">
                  <ComplianceRing
                    value={score.ratio}
                    size={180}
                    strokeWidth={14}
                    status={score.status}
                  />
                  <BandBadge band={score.band} className="mt-3" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <SimpleComplianceBar current={score.ratio} target={score.target} />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-jetbrains font-bold text-xl">{score.nationals_full_time}</p>
                      <p className="text-xs text-muted-foreground">Full-time Nationals</p>
                    </div>
                    <div>
                      <p className="font-jetbrains font-bold text-xl">{score.nationals_part_time}</p>
                      <p className="text-xs text-muted-foreground">Part-time Nationals</p>
                    </div>
                    <div>
                      <p className="font-jetbrains font-bold text-xl">{score.nationals_contract}</p>
                      <p className="text-xs text-muted-foreground">Contract (excluded)</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t('Last calculated')}: {new Date().toLocaleDateString()} · {score.program} Programme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Preview */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-sora text-lg">{t('90-Day Forecast')}</CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/forecast')}>
                {t('View Full Forecast')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {forecastData?.risk_date && (
                <div className="mb-4 p-3 rounded-lg bg-amber-light flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber" />
                  <p className="text-sm text-amber">
                    <strong>⚠ Ratio may drop below minimum around {forecastData.risk_date}</strong>
                  </p>
                </div>
              )}

              {forecastData?.data && forecastData.data.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.slate300} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                      <Tooltip />
                      <ReferenceLine y={forecastData.target} stroke={CHART_COLORS.red} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="historical" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.navy} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : forecastData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">30-day</p>
                      <p className="font-jetbrains font-bold text-lg">{formatPercent(forecastData.projected_30d)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">60-day</p>
                      <p className="font-jetbrains font-bold text-lg">{formatPercent(forecastData.projected_60d)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">90-day</p>
                      <p className="font-jetbrains font-bold text-lg">{formatPercent(forecastData.projected_90d)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No forecast data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Regulatory Alerts */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-sora text-lg flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                {t('Recent Regulatory Changes')}
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/regulatory')}>
                {t('View All')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRegChanges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent changes</p>
              ) : recentRegChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{COUNTRY_FLAGS[change.country as keyof typeof COUNTRY_FLAGS]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            change.impact_level === 'HIGH' && 'badge-high-impact',
                            change.impact_level === 'MEDIUM' && 'badge-medium-impact',
                            change.impact_level === 'LOW' && 'badge-low-impact'
                          )}
                        >
                          {change.impact_level}
                        </span>
                        <span className="text-xs text-muted-foreground">{change.effective_date}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{change.headline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Recommendations */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-sora text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                {t('Priority Actions')}
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/recommendations')}>
                {t('View All')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topRecommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recommendations</p>
              ) : topRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <PriorityBadge priority={rec.priority} />
                    {rec.compliance_gain && (
                      <ComplianceGainChip gain={rec.compliance_gain} />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2">{rec.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zone C: Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Breakdown */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-sora text-lg">{t('Headcount by Department')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {department_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={department_breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.slate300} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                    <YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} width={80} stroke={CHART_COLORS.slate400} />
                    <Tooltip />
                    <Bar dataKey="nationals" stackId="a" fill={CHART_COLORS.teal} name="Nationals" />
                    <Bar dataKey="expats" stackId="a" fill={CHART_COLORS.slate300} name="Expats" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-16">No department data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance History */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-sora text-lg">{t('Compliance History')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {compliance_history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compliance_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.slate300} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} stroke={CHART_COLORS.slate400} />
                    <Tooltip />
                    <ReferenceLine y={score.target} stroke={CHART_COLORS.red} strokeDasharray="5 5" label="Min Target" />
                    <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.teal} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.teal }} name="Ratio" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-16">No history data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entity Summary */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-sora text-lg">{t('Entity Summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entities.map((entity) => {
                const entityScore = isDemoMode
                  ? (dashboardData.entity.id === entity.id
                    ? dashboardData.score
                    : { ratio: 0, status: 'UNKNOWN' as ComplianceStatus, band: 'UNKNOWN' })
                  : (allScores[entity.id] || { ratio: 0, status: 'UNKNOWN' as ComplianceStatus, band: 'UNKNOWN' });

                return (
                  <div
                    key={entity.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer',
                      selectedEntity.id === entity.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => navigate('/compliance')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{COUNTRY_FLAGS[entity.country]}</span>
                        <div>
                          <p className="text-sm font-medium">{entity.name}</p>
                          <p className="text-xs text-muted-foreground">{entity.industry_sector}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-jetbrains font-bold">
                          {formatPercent(entityScore.ratio)}
                        </p>
                        <StatusBadge status={entityScore.status} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Partner Welcome Banner */}
      {isPartner && !bannerDismissed && (
        <Card className="shadow-card border-amber bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-sora font-bold text-sm">Welcome, Design Partner!</p>
                <p className="text-xs text-muted-foreground">Your 12-month free access is active. Your feedback shapes this product.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { localStorage.setItem('partner_banner_dismissed', 'true'); setBannerDismissed(true); }}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      <ShareComplianceModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        entity={selectedEntity}
        score={score}
      />
    </div>
  );
}
