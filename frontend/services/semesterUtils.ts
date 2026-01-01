/**
 * Semester to Year Mapping Utility
 * 
 * Academic Structure:
 * Year 1 → Semesters 1 & 2
 * Year 2 → Semesters 3 & 4
 * Year 3 → Semesters 5 & 6
 */

/**
 * Convert Year number to array of semester numbers
 * @param year - Year number (1, 2, or 3)
 * @returns Array of semester numbers for that year
 */
export function yearToSemesters(year: number): number[] {
  switch (year) {
    case 1:
      return [1, 2];
    case 2:
      return [3, 4];
    case 3:
      return [5, 6];
    default:
      return [];
  }
}

/**
 * Convert Semester number to Year
 * @param semester - Semester number (1-6)
 * @returns Year number (1-3)
 */
export function semesterToYear(semester: number): number {
  if (semester <= 2) return 1;
  if (semester <= 4) return 2;
  if (semester <= 6) return 3;
  return 0;
}

/**
 * Get display label for a year
 * @param year - Year number (1, 2, or 3)
 * @returns Display label (e.g., "YEAR 1")
 */
export function getYearLabel(year: number): string {
  switch (year) {
    case 1:
      return 'YEAR 1';
    case 2:
      return 'YEAR 2';
    case 3:
      return 'YEAR 3';
    default:
      return 'Unknown';
  }
}

/**
 * Get display label for a semester
 * @param semester - Semester number (1-6)
 * @returns Display label (e.g., "Semester 1")
 */
export function getSemesterLabel(semester: number): string {
  return `Semester ${semester}`;
}

/**
 * Get all available years
 * @returns Array of year numbers [1, 2, 3]
 */
export function getAllYears(): number[] {
  return [1, 2, 3];
}

/**
 * Get semester description (helpful for students)
 * @param semester - Semester number
 * @returns Detailed description
 */
export function getSemesterDescription(semester: number): string {
  const year = semesterToYear(semester);
  const term = semester % 2 === 1 ? 'First' : 'Second';
  return `${term} Semester of Year ${year}`;
}
