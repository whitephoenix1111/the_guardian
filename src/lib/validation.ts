// Validate từng gate bằng JS thuần

export type ChecklistItemType = 'checkbox' | 'number' | 'select';

export interface ChecklistItem {
  id: string;
  label: string;
  type: ChecklistItemType;
  operator?: '>=' | '<=';
  threshold?: number;
  options?: string[];
}

export type ChecklistValue = boolean | number | string;

export function validateGate1(narrative: string): boolean {
  return narrative.trim().length >= 100;
}

export function validateGate2(checklist: ChecklistValue[], items: ChecklistItem[]): boolean {
  if (!items.length || checklist.length !== items.length) return false;
  return items.every((item, i) => {
    const val = checklist[i];
    switch (item.type) {
      case 'checkbox':
        return val === true;
      case 'number': {
        const num = typeof val === 'number' ? val : parseFloat(val as string);
        if (isNaN(num)) return false;
        if (item.threshold === undefined) return true;
        return item.operator === '>=' ? num >= item.threshold : num <= item.threshold;
      }
      case 'select':
        return typeof val === 'string' && val.trim().length > 0;
      default:
        return false;
    }
  });
}

export function validateGate3(riskPercent: number, maxRisk: number = 1.0): boolean {
  return riskPercent <= maxRisk;
}

export function validateGate4(preMortem: string): boolean {
  return preMortem.trim().length > 0;
}

export function calcRiskPercent(entry: number, stop: number, equity: number, lotSize: number = 1): number {
  if (!equity || equity === 0) return 0;
  const pipRisk = Math.abs(entry - stop);
  const dollarRisk = pipRisk * lotSize * 10000;
  return (dollarRisk / equity) * 100;
}
