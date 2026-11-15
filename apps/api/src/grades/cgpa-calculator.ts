export interface GradeScaleItemDef {
  letter: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
}

export interface AssessmentScoreInput {
  score: number;
  maxScore: number;
  weightagePct: number;
}

export interface CourseGradeResult {
  totalPercentage: number;
  letter: string;
  gradePoint: number;
}

export interface TermCourseInput {
  credits: number;
  gradePoint: number;
}

export interface ExamEligibilityResult {
  isEligible: boolean;
  attendancePct: number;
  shortfallPct: number;
  canMissClassesToRemainEligible: number;
}

/**
 * Standard 4.0 US Scale fallback
 */
export const DEFAULT_GRADE_SCALE: GradeScaleItemDef[] = [
  { letter: 'A+', minPercent: 90, maxPercent: 100, gradePoint: 4.0 },
  { letter: 'A', minPercent: 85, maxPercent: 89.99, gradePoint: 3.75 },
  { letter: 'A-', minPercent: 80, maxPercent: 84.99, gradePoint: 3.5 },
  { letter: 'B+', minPercent: 75, maxPercent: 79.99, gradePoint: 3.25 },
  { letter: 'B', minPercent: 70, maxPercent: 74.99, gradePoint: 3.0 },
  { letter: 'B-', minPercent: 65, maxPercent: 69.99, gradePoint: 2.75 },
  { letter: 'C+', minPercent: 60, maxPercent: 64.99, gradePoint: 2.5 },
  { letter: 'C', minPercent: 55, maxPercent: 59.99, gradePoint: 2.25 },
  { letter: 'D', minPercent: 50, maxPercent: 54.99, gradePoint: 2.0 },
  { letter: 'F', minPercent: 0, maxPercent: 49.99, gradePoint: 0.0 },
];

/**
 * Calculate final course percentage, letter grade, and grade point
 */
export function calculateCourseGrade(
  assessments: AssessmentScoreInput[],
  scale: GradeScaleItemDef[] = DEFAULT_GRADE_SCALE,
): CourseGradeResult {
  if (assessments.length === 0) {
    return { totalPercentage: 0, letter: 'F', gradePoint: 0 };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const a of assessments) {
    if (a.maxScore <= 0 || a.weightagePct <= 0) continue;
    const normalized = Math.min(100, Math.max(0, (a.score / a.maxScore) * 100));
    totalWeightedScore += (normalized * a.weightagePct) / 100;
    totalWeight += a.weightagePct;
  }

  // If weights don't sum to 100, scale proportionally
  const finalPercentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  const roundedPct = Math.round(finalPercentage * 100) / 100;

  // Find matching scale item
  const match = scale.find(
    (item) => roundedPct >= item.minPercent && roundedPct <= item.maxPercent + 0.001,
  );

  if (match) {
    return {
      totalPercentage: roundedPct,
      letter: match.letter,
      gradePoint: match.gradePoint,
    };
  }

  // Fallback if below 0 or above 100
  if (roundedPct > 100) {
    const highest = scale[0]!;
    return { totalPercentage: roundedPct, letter: highest.letter, gradePoint: highest.gradePoint };
  }

  const lowest = scale[scale.length - 1]!;
  return { totalPercentage: roundedPct, letter: lowest.letter, gradePoint: lowest.gradePoint };
}

/**
 * Calculate Term Grade Point Average (GPA)
 * GPA = Sum(credits * gradePoint) / Sum(credits)
 */
export function calculateTermGpa(courses: TermCourseInput[]): number {
  if (courses.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    if (c.credits <= 0) continue;
    totalPoints += c.credits * c.gradePoint;
    totalCredits += c.credits;
  }

  if (totalCredits === 0) return 0.0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Calculate Cumulative Grade Point Average (CGPA) across all completed semesters
 */
export function calculateCumulativeGpa(
  terms: Array<{ termCredits: number; termGpa: number }>,
): number {
  if (terms.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const t of terms) {
    if (t.termCredits <= 0) continue;
    totalPoints += t.termCredits * t.termGpa;
    totalCredits += t.termCredits;
  }

  if (totalCredits === 0) return 0.0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Check semester exam attendance eligibility against university compliance threshold (default 75%)
 * Calculates how many more classes student can miss while maintaining >= 75%
 */
export function checkExamEligibility(
  attendedClasses: number,
  totalClassesHeld: number,
  minRequiredPct = 75,
  totalClassesInSemester = 24,
): ExamEligibilityResult {
  if (totalClassesHeld <= 0) {
    return {
      isEligible: true,
      attendancePct: 100,
      shortfallPct: 0,
      canMissClassesToRemainEligible: 0,
    };
  }

  const attendancePct = Math.round((attendedClasses / totalClassesHeld) * 1000) / 10;
  const isEligible = attendancePct >= minRequiredPct;
  const shortfallPct = isEligible ? 0 : Math.round((minRequiredPct - attendancePct) * 10) / 10;

  // Number of consecutive upcoming classes the student can miss right now while remaining >= minRequiredPct
  // attended / (totalHeld + m) >= minRatio => m <= (attended - minRatio * totalHeld) / minRatio
  const minRatio = minRequiredPct / 100;
  const canMissClassesToRemainEligible = Math.max(
    0,
    Math.floor((attendedClasses - minRatio * totalClassesHeld) / minRatio),
  );

  return {
    isEligible,
    attendancePct,
    shortfallPct,
    canMissClassesToRemainEligible,
  };
}
