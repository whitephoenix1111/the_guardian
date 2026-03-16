import { create } from 'zustand';
import { validateGate2, ChecklistItem, ChecklistValue } from '@/lib/validation';

export type GateStatus = 'locked' | 'in-progress' | 'done';

export interface PlanData {
  instrument: string;
  checklistId: string;
  checklistName: string;
  narrative: string;         // giữ lại trong data nhưng không dùng trong flow
  checklist: ChecklistValue[];
  checklistItems: ChecklistItem[];
  maxUsd: number;            // Gate 3 mới: số USD tối đa cho lệnh
  risk: {                    // giữ lại để không break Gate5 summary
    entry: number;
    stop: number;
    equity: number;
    riskPercent: number;
  };
  preMortem: string;         // giữ lại trong data nhưng không dùng trong flow
}

interface GuardianState {
  currentGate: number;
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
  checklistId: '',
  checklistName: '',
  narrative: '',
  checklist: [],
  checklistItems: [],
  maxUsd: 0,
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

// Flow hiện tại: 0 → 2 → 3 → 5 (bỏ 1, 4)
const SKIP_GATES = new Set([1, 4]);

function nextGate(current: number): number {
  let n = current + 1;
  while (SKIP_GATES.has(n)) n++;
  return n;
}

function prevGate(current: number): number {
  let p = current - 1;
  while (p > 0 && SKIP_GATES.has(p)) p--;
  return p;
}

export const useGuardianStore = create<GuardianState>((set, get) => ({
  currentGate: 0,
  gateStatus: initialGateStatus,
  planData: initialPlanData,

  setPlanData: (partial) =>
    set((state) => ({ planData: { ...state.planData, ...partial } })),

  canAdvance: () => {
    const { currentGate, planData } = get();
    switch (currentGate) {
      case 0: return planData.instrument.trim().length > 0 && planData.checklistId.trim().length > 0;
      case 2: return validateGate2(planData.checklist, planData.checklistItems);
      case 3: return planData.maxUsd > 0;
      default: return false;
    }
  },

  advance: () => {
    const { currentGate, canAdvance } = get();
    if (!canAdvance() || currentGate >= 5) return;
    const next = nextGate(currentGate);

    // đánh dấu tất cả gate bị skip là done
    const skippedUpdates: Record<number, GateStatus> = {};
    for (let g = currentGate + 1; g < next; g++) {
      skippedUpdates[g] = 'done';
    }

    set((state) => ({
      currentGate: next,
      gateStatus: {
        ...state.gateStatus,
        [currentGate]: 'done',
        ...skippedUpdates,
        [next]: 'in-progress',
      },
    }));
  },

  goBack: () => {
    const { currentGate } = get();
    if (currentGate <= 0) return;
    const prev = prevGate(currentGate);

    const skippedUpdates: Record<number, GateStatus> = {};
    for (let g = prev + 1; g <= currentGate; g++) {
      skippedUpdates[g] = 'locked';
    }

    set((state) => ({
      currentGate: prev,
      gateStatus: {
        ...state.gateStatus,
        ...skippedUpdates,
        [prev]: 'in-progress',
      },
    }));
  },

  reset: () =>
    set({ currentGate: 0, gateStatus: initialGateStatus, planData: initialPlanData }),
}));
