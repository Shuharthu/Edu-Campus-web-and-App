import {
  calculateCourseGrade,
  calculateTermGpa,
  calculateCumulativeGpa,
  checkExamEligibility,
  DEFAULT_GRADE_SCALE,
} from './cgpa-calculator';

describe('CGPA and Exam Eligibility Calculator', () => {
  describe('calculateCourseGrade', () => {
    it('should correctly calculate course percentage, letter, and GPA according to weightage', () => {
      // Rafiq Hasan's exact mock scores in CSE204
      const assessments = [
        { score: 83.3, maxScore: 100, weightagePct: 10 }, // Attendance 10%
        { score: 88.0, maxScore: 100, weightagePct: 15 }, // Quizzes 15%
        { score: 58.0, maxScore: 100, weightagePct: 25 }, // Midterm 25% (Risk Callout)
        { score: 95.0, maxScore: 100, weightagePct: 20 }, // Assignments 20%
        { score: 78.0, maxScore: 100, weightagePct: 30 }, // Final Exam 30%
      ];

      const result = calculateCourseGrade(assessments, DEFAULT_GRADE_SCALE);
      // Expected = 8.33 + 13.2 + 14.5 + 19.0 + 23.4 = 78.43%
      expect(result.totalPercentage).toBeCloseTo(78.43, 1);
      expect(result.letter).toBe('B+');
      expect(result.gradePoint).toBe(3.25);
    });

    it('should award A+ for scores >= 90%', () => {
      const assessments = [{ score: 95, maxScore: 100, weightagePct: 100 }];
      const result = calculateCourseGrade(assessments);
      expect(result.letter).toBe('A+');
      expect(result.gradePoint).toBe(4.0);
    });

    it('should award F for scores < 50%', () => {
      const assessments = [{ score: 45, maxScore: 100, weightagePct: 100 }];
      const result = calculateCourseGrade(assessments);
      expect(result.letter).toBe('F');
      expect(result.gradePoint).toBe(0.0);
    });
  });

  describe('calculateTermGpa', () => {
    it('should correctly calculate credit-weighted Term GPA', () => {
      // 4 courses taken in Semester 4
      const courses = [
        { credits: 3.0, gradePoint: 3.0 }, // CSE204: B (3.0)
        { credits: 3.0, gradePoint: 2.75 }, // MAT201: B- (2.75)
        { credits: 3.0, gradePoint: 3.5 }, // EEE201: A- (3.5)
        { credits: 1.5, gradePoint: 4.0 }, // CSE205 Lab: A (4.0)
      ];

      // Points = 3*3.0 + 3*2.75 + 3*3.5 + 1.5*4.0 = 9 + 8.25 + 10.5 + 6.0 = 33.75
      // Credits = 3 + 3 + 3 + 1.5 = 10.5
      // GPA = 33.75 / 10.5 = 3.214... -> 3.21
      const gpa = calculateTermGpa(courses);
      expect(gpa).toBe(3.21);
    });

    it('should return 0.0 when no courses are taken', () => {
      expect(calculateTermGpa([])).toBe(0.0);
    });
  });

  describe('calculateCumulativeGpa', () => {
    it('should correctly calculate cumulative CGPA across multiple semesters', () => {
      const terms = [
        { termCredits: 15, termGpa: 3.4 },
        { termCredits: 15, termGpa: 3.1 },
        { termCredits: 14, termGpa: 3.2 },
        { termCredits: 10, termGpa: 3.21 },
      ];

      // Total Points = 15*3.4 + 15*3.1 + 14*3.2 + 10*3.21 = 51 + 46.5 + 44.8 + 32.1 = 174.4
      // Total Credits = 54
      // CGPA = 174.4 / 54 = 3.229... -> 3.23
      const cgpa = calculateCumulativeGpa(terms);
      expect(cgpa).toBeCloseTo(3.23, 2);
    });
  });

  describe('checkExamEligibility', () => {
    it('should match the exact Ask Smart EDU mockup calculation (15 of 18 classes = 83.3%, can miss 2 more)', () => {
      // In mockup: "You have attended 15 of 18 classes, which is 83.3%. You can miss 2 more and still be at 75.0%, the minimum for the exam."
      const eligibility = checkExamEligibility(15, 18, 75, 24);
      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.attendancePct).toBe(83.3);
      expect(eligibility.shortfallPct).toBe(0);
      expect(eligibility.canMissClassesToRemainEligible).toBe(2);
    });

    it('should flag student as ineligible when below 75%', () => {
      const eligibility = checkExamEligibility(10, 15, 75); // 66.7%
      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.attendancePct).toBe(66.7);
      expect(eligibility.shortfallPct).toBe(8.3);
    });
  });
});
