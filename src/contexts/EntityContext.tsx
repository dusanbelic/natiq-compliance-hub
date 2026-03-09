import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Entity, DashboardData } from '@/types/database';
import { MOCK_ENTITIES, MOCK_DASHBOARD_DATA } from '@/lib/mockData';

interface EntityContextType {
  entities: Entity[];
  selectedEntityId: string;
  selectedEntity: Entity;
  dashboardData: DashboardData;
  setSelectedEntityId: (id: string) => void;
  atRiskEntities: Entity[];
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entities] = useState<Entity[]>(MOCK_ENTITIES);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(MOCK_ENTITIES[0].id);

  const selectedEntity = useMemo(() => {
    return entities.find(e => e.id === selectedEntityId) ?? entities[0];
  }, [entities, selectedEntityId]);

  const dashboardData = useMemo(() => {
    return MOCK_DASHBOARD_DATA[selectedEntityId] ?? MOCK_DASHBOARD_DATA[entities[0].id];
  }, [selectedEntityId, entities]);

  const atRiskEntities = useMemo(() => {
    return entities.filter(entity => {
      const data = MOCK_DASHBOARD_DATA[entity.id];
      return data && (data.score.status === 'AT_RISK' || data.score.status === 'NON_COMPLIANT');
    });
  }, [entities]);

  return (
    <EntityContext.Provider
      value={{
        entities,
        selectedEntityId,
        selectedEntity,
        dashboardData,
        setSelectedEntityId,
        atRiskEntities,
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
