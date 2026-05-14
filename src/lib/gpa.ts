export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  D: 1.0, F: 0.0,
};

export const ALLOWED_GRADES = Object.keys(GRADE_POINTS);

export function gradeToPoint(grade: string): number {
  const g = grade.trim().toUpperCase();
  if (!(g in GRADE_POINTS)) throw new Error(`Invalid grade: ${grade}`);
  return GRADE_POINTS[g];
}

export function calcGpa(items: { credits: number; gradePoint: number }[]): number {
  const totalCredits = items.reduce((s, i) => s + Number(i.credits), 0);
  if (totalCredits === 0) return 0;
  const weighted = items.reduce((s, i) => s + Number(i.credits) * Number(i.gradePoint), 0);
  return weighted / totalCredits;
}

export function gpaTone(gpa: number): "excellent" | "good" | "average" | "poor" {
  if (gpa >= 3.7) return "excellent";
  if (gpa >= 3.0) return "good";
  if (gpa >= 2.0) return "average";
  return "poor";
}

export function gpaBadgeClass(gpa: number): string {
  const t = gpaTone(gpa);
  switch (t) {
    case "excellent": return "bg-[oklch(0.65_0.18_150)/0.15] text-[oklch(0.45_0.18_150)] dark:text-[oklch(0.8_0.18_150)] border border-[oklch(0.65_0.18_150)/0.3]";
    case "good": return "bg-primary/15 text-primary border border-primary/30";
    case "average": return "bg-[oklch(0.78_0.16_80)/0.18] text-[oklch(0.5_0.16_80)] dark:text-[oklch(0.85_0.16_80)] border border-[oklch(0.78_0.16_80)/0.4]";
    case "poor": return "bg-destructive/15 text-destructive border border-destructive/30";
  }
}
