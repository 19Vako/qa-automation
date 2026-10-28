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

it('повертає оцінку A для балів >= 90', () => {
  expect(calcStudentGrade(90, 90, 90).ects).toBe('A');
});

it.each([
  { labs: 89, tests: 89, project: 89, expected: 'B' },
  { labs: 82, tests: 82, project: 82, expected: 'B' },
  { labs: 81, tests: 81, project: 81, expected: 'C' },
  { labs: 74, tests: 74, project: 74, expected: 'C' },
])('межові значення: бали $labs → ЄКТС $expected', ({ labs, tests, project, expected }) => {
  expect(calcStudentGrade(labs, tests, project).ects).toBe(expected);
});