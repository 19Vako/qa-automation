function assertValidScore(score: number): void {
  if (score < 0 || score > 100) throw new Error('INVALID_SCORE');
}

export function getECTSGrade(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 82) return 'B';
  if (total >= 74) return 'C';
  if (total >= 64) return 'D';
  if (total >= 60) return 'E';
  return 'F';
}

export function calcStudentGrade(labs: number, tests: number, project: number) {
  [labs, tests, project].forEach(assertValidScore);
  const total = Math.round(labs * 0.3 + tests * 0.3 + project * 0.4);
  return { total, ects: getECTSGrade(total) };
}