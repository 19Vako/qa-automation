import { describe, expect, it } from 'vitest';
import { calculateSimpleInterest } from '../src/interest';

describe('calculateSimpleInterest', () => {
  it('should correctly calculate simple interest for standard positive values', () => {
    const result = calculateSimpleInterest({
      principal: 1000,
      rate: 5,
      years: 2,
    });
    expect(result).toBe(100);
  });

  it('should correctly calculate simple interest with fractional rate', () => {
    const result = calculateSimpleInterest({
      principal: 5000,
      rate: 3.5,
      years: 10,
    });
    expect(result).toBe(1750);
  });

  it('should return zero when rate or years is zero', () => {
    const resultZeroRate = calculateSimpleInterest({
      principal: 1000,
      rate: 0,
      years: 5,
    });
    const resultZeroYears = calculateSimpleInterest({
      principal: 1000,
      rate: 5,
      years: 0,
    });

    expect(resultZeroRate).toBe(0);
    expect(resultZeroYears).toBe(0);
  });

  it('should throw an error when interest rate is negative', () => {
    expect(() =>
      calculateSimpleInterest({ principal: 1000, rate: -5, years: 2 }),
    ).toThrow('Rate cannot be negative');
  });
});
