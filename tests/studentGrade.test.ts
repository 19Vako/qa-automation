import { it, expect } from 'vitest';
import { calcStudentGrade } from '../src/studentGrade';

it.each([
  [-1, 50, 50],
  [101, 50, 50]
])('відхиляє бали поза діапазоном %i, %i, %i', (labs, tests, project) => {
  
  expect(() => calcStudentGrade(labs, tests, project)).toThrow('INVALID_SCORE');
});

it('коректно рахує загальний бал з ваговими коефіцієнтами', () => {
  expect(calcStudentGrade(100, 100, 100)?.total).toBe(100);
});

it('заокруглює результат до найближчого цілого', () => {
  expect(calcStudentGrade(95, 90, 88).total).toBe(91);
});