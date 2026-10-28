function assertValidScore(score: number): void {
  if (score < 0 || score > 100) throw new Error('INVALID_SCORE');
}

export function calcStudentGrade(labs: number, tests: number, project: number) {
  [labs, tests, project].forEach(assertValidScore);
  return null;
}