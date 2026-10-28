function assertValidScore(score: number): void {
  if (score < 0 || score > 100) throw new Error('INVALID_SCORE');
}

export function calcStudentGrade(labs: number, tests: number, project: number) {
  [labs, tests, project].forEach(assertValidScore);
  const total = Math.round(labs * 0.3 + tests * 0.3 + project * 0.4);
  
  let ects = 'A';
  if (total < 90 && total >= 82) ects = 'B';
  if (total < 82 && total >= 74) ects = 'C';
  
  return { total, ects };
}