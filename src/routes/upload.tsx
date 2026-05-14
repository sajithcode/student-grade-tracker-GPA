import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CloudUpload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseExcel, downloadTemplate, type ParsedRow } from "@/lib/excelParser";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <UploadPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

type Summary = {
  totalRows: number;
  inserted: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

function UploadPage() {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!/\.xlsx?$/i.test(file.name)) {
      toast.error("Please upload a .xlsx or .xls file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setBusy(true);
    setProgress(10);
    setSummary(null);
    try {
      const { rows, errors } = await parseExcel(file);
      setProgress(35);
      if (rows.length === 0) {
        setSummary({ totalRows: 0, inserted: 0, skipped: 0, errors });
        toast.error("No valid rows found");
        return;
      }
      const result = await persist(rows, (p) => setProgress(35 + Math.round(p * 0.6)));
      setProgress(100);
      setSummary({ totalRows: rows.length, ...result, errors });
      if (result.inserted > 0) toast.success(`Imported ${result.inserted} result rows`);
      if (errors.length) toast.warning(`${errors.length} row(s) had validation errors`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upload results</h1>
          <p className="text-sm text-muted-foreground">Drag & drop an Excel file with student results.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="size-4" /> Download template
        </Button>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
              drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40",
            )}
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CloudUpload className="size-7" />
            </div>
            <div className="text-base font-medium">Drop your .xlsx file here</div>
            <div className="text-xs text-muted-foreground">or click to browse · max 10MB</div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>

          {busy && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-primary" /> Upload summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Total rows" value={summary.totalRows} />
              <Stat label="Imported" value={summary.inserted} accent="success" />
              <Stat label="Duplicates skipped" value={summary.skipped} />
              <Stat label="Errors" value={summary.errors.length} accent={summary.errors.length ? "danger" : undefined} />
            </div>
            {summary.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="size-4" /> Validation errors
                </div>
                <ul className="max-h-56 space-y-1 overflow-auto text-xs text-destructive/90">
                  {summary.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.inserted > 0 && (
              <div className="flex items-center gap-2 text-sm text-[oklch(0.5_0.18_150)] dark:text-[oklch(0.8_0.18_150)]">
                <CheckCircle2 className="size-4" /> Records saved successfully.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "success" | "danger" }) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          accent === "success" && "text-[oklch(0.5_0.18_150)] dark:text-[oklch(0.8_0.18_150)]",
          accent === "danger" && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}

async function persist(
  rows: ParsedRow[],
  onProgress: (p: number) => void,
): Promise<{ inserted: number; skipped: number }> {
  // Upsert students
  const studentsMap = new Map<string, { student_id: string; name: string }>();
  rows.forEach((r) => studentsMap.set(r.Student_ID, { student_id: r.Student_ID, name: r.Student_Name }));
  const { data: studentRows, error: sErr } = await supabase
    .from("students")
    .upsert(Array.from(studentsMap.values()), { onConflict: "student_id" })
    .select("id, student_id");
  if (sErr) throw sErr;
  onProgress(0.3);
  const studentIdMap = new Map(studentRows!.map((s) => [s.student_id, s.id]));

  // Upsert courses
  const coursesMap = new Map<string, { code: string; name: string; credits: number }>();
  rows.forEach((r) => coursesMap.set(r.Course_Code, { code: r.Course_Code, name: r.Course_Name, credits: r.Credits }));
  const { data: courseRows, error: cErr } = await supabase
    .from("courses")
    .upsert(Array.from(coursesMap.values()), { onConflict: "code" })
    .select("id, code");
  if (cErr) throw cErr;
  onProgress(0.6);
  const courseIdMap = new Map(courseRows!.map((c) => [c.code, c.id]));

  // Upsert results
  const resultPayload = rows.map((r) => ({
    student_id: studentIdMap.get(r.Student_ID)!,
    course_id: courseIdMap.get(r.Course_Code)!,
    semester: r.Semester,
    grade: r.Grade,
    grade_point: r.gradePoint,
  }));

  const { data: existing } = await supabase
    .from("results")
    .select("student_id, course_id, semester");
  const existingKeys = new Set((existing ?? []).map((e) => `${e.student_id}-${e.semester}-${e.course_id}`));
  const toInsertCount = resultPayload.filter((r) => !existingKeys.has(`${r.student_id}-${r.semester}-${r.course_id}`)).length;

  const { error: rErr, count } = await supabase
    .from("results")
    .upsert(resultPayload, { onConflict: "student_id,semester,course_id", count: "exact" });
  if (rErr) throw rErr;
  onProgress(1);

  return {
    inserted: toInsertCount,
    skipped: resultPayload.length - toInsertCount,
  };
}
