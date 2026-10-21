export interface SimpleInterestParams {
  principal: number;
  rate: number;
  years: number;
}

export function calculateSimpleInterest({
  principal,
  rate,
  years,
}: SimpleInterestParams): number {
  if (rate < 0) {
    throw new Error('Rate cannot be negative');
  }

  if (principal < 0 || years < 0) {
    throw new Error('Principal and years must be non-negative');
  }

  return (principal * rate * years) / 100;
}
