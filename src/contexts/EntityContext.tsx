import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { Entity, DashboardData, ScoreDetails, ComplianceStatus, ComplianceBand } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_ENTITIES, MOCK_DASHBOARD_DATA, PROGRAM_NAMES } from '@/lib/mockData';
import type { Tables } from '@/integrations/supabase/types';

interface EntityContextType {
  entities: Entity[];
  selectedEntityId: string;
  selectedEntity: Entity;
  dashboardData: DashboardData;
  setSelectedEntityId: (id: string) => void;
  atRiskEntities: Entity[];
  loading: boolean;
  allScores: Record<string, ScoreDetails>;
  employeesByEntity: Record<string, Tables<'employees'>[]>;
  refreshEntityData: () => void;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

function computeScoreFromEmployees(
  employees: Tables<'employees'>[],
  entity: Entity,
  complianceScore?: Tables<'compliance_scores'> | null
): ScoreDetails {
  const qualifying = employees.filter(e => e.counts_toward_quota !== false);
  const nationals = qualifying.filter(e => e.is_national);
  const total = qualifying.length;
  const nationalCount = nationals.length;
  const ratio = total > 0 ? (nationalCount / total) * 100 : 0;

  const nationalsFt = nationals.filter(e => e.contract_type === 'full_time').length;
  const nationalsPt = nationals.filter(e => e.contract_type === 'part_time').length;
  const nationalsContract = employees.filter(e => e.is_national && e.contract_type === 'contract').length;

  // Determine target from compliance score or default by country
  const defaultTargets: Record<string, number> = { SA: 15, AE: 10, QA: 10, OM: 10 };
  const target = defaultTargets[entity.country] ?? 10;

  const gap = Math.max(0, Math.ceil((target / 100) * total - nationalCount));

  let status: ComplianceStatus = 'UNKNOWN';
  let band: ComplianceBand = 'GREEN';

  if (complianceScore) {
    status = (complianceScore.status as ComplianceStatus) ?? 'UNKNOWN';
    band = (complianceScore.band as ComplianceBand) ?? 'GREEN';
  } else {
    if (ratio >= target * 1.5) { status = 'COMPLIANT'; band = 'PLATINUM'; }
    else if (ratio >= target) { status = 'COMPLIANT'; band = 'GREEN'; }
    else if (ratio >= target * 0.8) { status = 'AT_RISK'; band = 'YELLOW'; }
    else { status = 'NON_COMPLIANT'; band = 'RED'; }
  }

  const program = PROGRAM_NAMES[entity.country] ?? 'Nationalization';

  // Group by department
  const deptMap = new Map<string, { nationals: number; expats: number }>();
  qualifying.forEach(e => {
    const dept = e.department || 'Other';
    const cur = deptMap.get(dept) || { nationals: 0, expats: 0 };
    if (e.is_national) cur.nationals++; else cur.expats++;
    deptMap.set(dept, cur);
  });

  const department_breakdown = Array.from(deptMap.entries()).map(([dept, counts]) => ({
    dept,
    nationals: counts.nationals,
    expats: counts.expats,
    total: counts.nationals + counts.expats,
    ratio: counts.nationals + counts.expats > 0
      ? (counts.nationals / (counts.nationals + counts.expats)) * 100
      : 0,
  })).sort((a, b) => b.total - a.total);

  return {
    ratio,
    status,
    band,
    national_count: nationalCount,
    total_count: total,
    quota_gap: gap,
    target,
    program,
    trend: 0,
    nationals_full_time: nationalsFt,
    nationals_part_time: nationalsPt,
    nationals_contract: nationalsContract,
    qualifying_nationals: nationalCount,
    qualifying_total: total,
    _department_breakdown: department_breakdown,
  } as ScoreDetails & { _department_breakdown: DashboardData['department_breakdown'] };
}

export function EntityProvider({ children }: { children: ReactNode }) {
  const { isDemoMode, user } = useAuth();
  const [entities, setEntities] = useState<Entity[]>(isDemoMode ? MOCK_ENTITIES : []);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(isDemoMode ? MOCK_ENTITIES[0].id : '');
  const [loading, setLoading] = useState(!isDemoMode);
  const [employeesByEntity, setEmployeesByEntity] = useState<Record<string, Tables<'employees'>[]>>({});
  const [scoresByEntity, setScoresByEntity] = useState<Record<string, Tables<'compliance_scores'>>>({});

  // Fetch entities and employees from Supabase
  useEffect(() => {
    if (isDemoMode) {
      setEntities(MOCK_ENTITIES);
      setSelectedEntityId(MOCK_ENTITIES[0].id);
      setLoading(false);
      return;
    }
    if (!user) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch entities
        const { data: entitiesData } = await supabase
          .from('entities')
          .select('*')
          .order('name');

        if (cancelled) return;

        const ents = (entitiesData || []) as Entity[];
        setEntities(ents);

        if (ents.length > 0) {
          setSelectedEntityId(prev => ents.find(e => e.id === prev) ? prev : ents[0].id);

          // Fetch all employees for all entities in parallel
          const empPromises = ents.map(e =>
            supabase.from('employees').select('*').eq('entity_id', e.id)
          );
          const scorePromises = ents.map(e =>
            supabase.from('compliance_scores').select('*').eq('entity_id', e.id)
              .order('calculated_at', { ascending: false }).limit(1)
          );

          const [empResults, scoreResults] = await Promise.all([
            Promise.all(empPromises),
            Promise.all(scorePromises),
          ]);

          if (cancelled) return;

          const empMap: Record<string, Tables<'employees'>[]> = {};
          const scrMap: Record<string, Tables<'compliance_scores'>> = {};

          ents.forEach((e, i) => {
            empMap[e.id] = (empResults[i].data || []) as Tables<'employees'>[];
            const s = scoreResults[i].data?.[0];
            if (s) scrMap[e.id] = s as Tables<'compliance_scores'>;
          });

          setEmployeesByEntity(empMap);
          setScoresByEntity(scrMap);
        }
      } catch (err) {
        console.error('Failed to fetch entity data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [isDemoMode, user]);

  const selectedEntity = useMemo(() => {
    return entities.find(e => e.id === selectedEntityId) ?? entities[0] ?? MOCK_ENTITIES[0];
  }, [entities, selectedEntityId]);

  // Compute all scores from live data
  const allScores = useMemo(() => {
    if (isDemoMode) return {};
    const result: Record<string, ScoreDetails> = {};
    entities.forEach(entity => {
      const emps = employeesByEntity[entity.id] || [];
      const score = scoresByEntity[entity.id];
      result[entity.id] = computeScoreFromEmployees(emps, entity, score);
    });
    return result;
  }, [isDemoMode, entities, employeesByEntity, scoresByEntity]);

  const dashboardData = useMemo((): DashboardData => {
    if (isDemoMode) {
      return MOCK_DASHBOARD_DATA[selectedEntityId] ?? MOCK_DASHBOARD_DATA[MOCK_ENTITIES[0].id];
    }

    const scoreWithDepts = allScores[selectedEntityId];
    if (!scoreWithDepts) {
      // Return a zero-state dashboard
      return {
        entity: selectedEntity,
        score: {
          ratio: 0, status: 'UNKNOWN', band: 'GREEN', national_count: 0, total_count: 0,
          quota_gap: 0, target: 10, program: 'Nationalization', trend: 0,
          nationals_full_time: 0, nationals_part_time: 0, nationals_contract: 0,
          qualifying_nationals: 0, qualifying_total: 0,
        },
        compliance_history: [],
        department_breakdown: [],
      };
    }

    const { _department_breakdown, ...score } = scoreWithDepts as ScoreDetails & { _department_breakdown: DashboardData['department_breakdown'] };

    return {
      entity: selectedEntity,
      score,
      compliance_history: [
        { month: 'Oct', ratio: Math.max(0, score.ratio - 3), target: score.target },
        { month: 'Nov', ratio: Math.max(0, score.ratio - 2), target: score.target },
        { month: 'Dec', ratio: Math.max(0, score.ratio - 1.2), target: score.target },
        { month: 'Jan', ratio: Math.max(0, score.ratio - 0.5), target: score.target },
        { month: 'Feb', ratio: score.ratio, target: score.target },
        { month: 'Mar', ratio: score.ratio, target: score.target },
      ],
      department_breakdown: _department_breakdown || [],
    };
  }, [isDemoMode, selectedEntityId, selectedEntity, allScores]);

  const atRiskEntities = useMemo(() => {
    if (isDemoMode) {
      return entities.filter(entity => {
        const data = MOCK_DASHBOARD_DATA[entity.id];
        return data && (data.score.status === 'AT_RISK' || data.score.status === 'NON_COMPLIANT');
      });
    }
    return entities.filter(entity => {
      const score = allScores[entity.id];
      return score && (score.status === 'AT_RISK' || score.status === 'NON_COMPLIANT');
    });
  }, [isDemoMode, entities, allScores]);

  return (
    <EntityContext.Provider
      value={{
        entities,
        selectedEntityId,
        selectedEntity,
        dashboardData,
        setSelectedEntityId,
        atRiskEntities,
        loading,
        allScores,
      }}
    >
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider');
  }
  return context;
}
