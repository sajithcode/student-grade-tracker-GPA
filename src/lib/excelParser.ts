import * as XLSX from "xlsx";
import { z } from "zod";
import { gradeToPoint, ALLOWED_GRADES } from "./gpa";

export const REQUIRED_COLUMNS = [
  "Student_ID",
  "Student_Name",
  "Semester",
  "Course_Code",
  "Course_Name",
  "Credits",
  "Grade",
] as const;

const RowSchema = z.object({
  Student_ID: z.union([z.string(), z.number()]).transform((v) => String(v).trim()),
  Student_Name: z.string().transform((v) => v.trim()),
  Semester: z.coerce.number().int().min(1).max(20),
  Course_Code: z.union([z.string(), z.number()]).transform((v) => String(v).trim()),
  Course_Name: z.string().transform((v) => v.trim()),
  Credits: z.coerce.number().min(0).max(20),
  Grade: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((g) => ALLOWED_GRADES.includes(g), { message: "Invalid grade" }),
});

export type ParsedRow = z.infer<typeof RowSchema> & { gradePoint: number };

export type ParseResult = {
  rows: ParsedRow[];
  errors: { row: number; message: string }[];
};

export async function parseExcel(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { rows: [], errors: [{ row: 0, message: "Workbook has no sheets" }] };

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (json.length === 0) return { rows: [], errors: [{ row: 0, message: "Sheet is empty" }] };

  const headers = Object.keys(json[0]);
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) {
    return { rows: [], errors: [{ row: 0, message: `Missing required columns: ${missing.join(", ")}` }] };
  }

  const rows: ParsedRow[] = [];
  const errors: { row: number; message: string }[] = [];
  json.forEach((raw, i) => {
    const parsed = RowSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ") });
      return;
    }
    rows.push({ ...parsed.data, gradePoint: gradeToPoint(parsed.data.Grade) });
  });
  return { rows, errors };
}

export function downloadTemplate() {
  const data = [
    {
      Student_ID: "2021001",
      Student_Name: "Ada Lovelace",
      Semester: 1,
      Course_Code: "CS101",
      Course_Name: "Intro to CS",
      Credits: 3,
      Grade: "A",
    },
    {
      Student_ID: "2021001",
      Student_Name: "Ada Lovelace",
      Semester: 1,
      Course_Code: "MA101",
      Course_Name: "Calculus I",
      Credits: 4,
      Grade: "B+",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, "gpa-template.xlsx");
}
