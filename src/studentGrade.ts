export function calcStudentGrade(labs: number, tests: number, project: number) {
  if (labs < 0 || labs > 100 || tests < 0 || tests > 100 || project < 0 || project > 100) {
    throw new Error('INVALID_SCORE');
  }
  return null;
}