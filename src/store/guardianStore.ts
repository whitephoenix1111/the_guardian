import { create } from 'zustand';
import { validateGate1, validateGate2, validateGate3, validateGate4, ChecklistItem, ChecklistValue } from '@/lib/validation';

export type GateStatus = 'locked' | 'in-progress' | 'done';

export interface PlanData {
  instrument: string;
  narrative: string;
  checklist: ChecklistValue[];
  checklistItems: ChecklistItem[];
  risk: {
    entry: number;
    stop: number;
    equity: number;
    riskPercent: number;
  };
  preMortem: string;
}

interface GuardianState {
  // Gate 0 = instrument selection, Gates 1–5 = existing flow
  currentGate: number;           // 0 | 1 | 2 | 3 | 4 | 5
  gateStatus: Record<number, GateStatus>;
  planData: PlanData;
  setPlanData: (partial: Partial<PlanData>) => void;
  advance: () => void;
  goBack: () => void;
  reset: () => void;
  canAdvance: () => boolean;
}

const initialPlanData: PlanData = {
  instrument: '',
  narrative: '',
  checklist: [],
  checklistItems: [],
  risk: { entry: 0, stop: 0, equity: 0, riskPercent: 0 },
  preMortem: '',
};

const initialGateStatus: Record<number, GateStatus> = {
  0: 'in-progress',
  1: 'locked',
  2: 'locked',
  3: 'locked',
  4: 'locked',
  5: 'locked',
};

export const useGuardianStore = create<GuardianState>((set, get) => ({
  currentGate: 0,
  gateStatus: initialGateStatus,
  planData: initialPlanData,

  setPlanData: (partial) =>
    set((state) => ({ planData: { ...state.planData, ...partial } })),

  canAdvance: () => {
    const { currentGate, planData } = get();
    switch (currentGate) {
      case 0: return planData.instrument.trim().length > 0;
      case 1: return validateGate1(planData.narrative);
      case 2: return validateGate2(planData.checklist, planData.checklistItems);
      case 3: return validateGate3(planData.risk.riskPercent);
      case 4: return validateGate4(planData.preMortem);
      default: return false;
    }
  },

  advance: () => {
    const { currentGate, canAdvance } = get();
    if (!canAdvance() || currentGate >= 5) return;
    const next = currentGate + 1;
    set((state) => ({
      currentGate: next,
      gateStatus: {
        ...state.gateStatus,
        [currentGate]: 'done',
        [next]: 'in-progress',
      },
    }));
  },

  goBack: () => {
    const { currentGate } = get();
    if (currentGate <= 0) return;
    const prev = currentGate - 1;
    set((state) => ({
      currentGate: prev,
      gateStatus: {
        ...state.gateStatus,
        [currentGate]: 'locked',
        [prev]: 'in-progress',
      },
    }));
  },

  reset: () =>
    set({ currentGate: 0, gateStatus: initialGateStatus, planData: initialPlanData }),
}));
