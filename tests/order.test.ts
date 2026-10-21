import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  calcRefund,
  type OrderItem,
} from '../src/order';
 
const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});
 
describe('calcSubtotal', () => {
  it('підсумовує вартість позицій з урахуванням кількості', () => {
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];
    const result = calcSubtotal(items);
    expect(result).toBe(350);
  });
 
  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });
 
  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });
 
  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const,  subtotal: 500,  expected: 0 },
    { tier: 'silver' as const, subtotal: 500,  expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 500,  expected: 0.1 },
    { tier: 'basic' as const,  subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );
 
  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });
 
  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });
 
  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1))
      .toThrow('INVALID_PROMO');
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});
 
describe('calcOrderTotal', () => {
  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });
 
  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });
 
  it('знижка може опустити суму нижче порога доставки', () => {
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });
 
  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('calcRefund', () => {
  // Параметризований тест із перевіркою межових значень (межа-1, межа, межа+1)
  // Очікувані значення задані явними числами без обчислень формулою
  it.each([
    { days: 13, expected: 1000 }, // межа 14 мінус 1
    { days: 14, expected: 1000 }, // межа 14
    { days: 15, expected: 700  }, // межа 14 плюс 1
    { days: 29, expected: 700  }, // межа 30 мінус 1
    { days: 30, expected: 700  }, // межа 30
  ])(
    'повертає правильну суму для $days днів після покупки',
    ({ days, expected }) => {
      expect(calcRefund(1000, days)).toBe(expected);
    }
  );

  it('викидає виняток REFUND_PERIOD_EXPIRED, якщо минуло понад 30 днів (межа 30 плюс 1)', () => {
    expect(() => calcRefund(1000, 31)).toThrow('REFUND_PERIOD_EXPIRED');
  });

  it('відхиляє від’ємну кількість днів із кодом помилки INVALID_DAYS', () => {
    expect(() => calcRefund(1000, -1)).toThrow('INVALID_DAYS');
  });

  it('відхиляє від’ємну загальну суму із кодом помилки NEGATIVE_TOTAL', () => {
    expect(() => calcRefund(-100, 5)).toThrow('NEGATIVE_TOTAL');
  });
});