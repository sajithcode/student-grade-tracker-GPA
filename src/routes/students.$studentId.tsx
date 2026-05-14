import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calcGpa, gpaBadgeClass } from "@/lib/gpa";

export const Route = createFileRoute("/students/$studentId")({
  component: StudentPage,
});

function StudentPage() {
  const { studentId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: async () => {
      const { data: s } = await supabase.from("students").select("*").eq("student_id", studentId).maybeSingle();
      if (!s) return null;
      const { data: r } = await supabase
        .from("results")
        .select("id, semester, grade, grade_point, course:courses(code, name, credits)")
        .eq("student_id", s.id)
        .order("semester", { ascending: true });
      return { student: s, results: (r ?? []) as any[] };
    },
  });

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/results"><ArrowLeft className="size-4" /> Back to results</Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Student not found.</CardContent></Card>
      ) : (
        <StudentBody data={data} />
      )}
    </AppShell>
  );
}

function StudentBody({ data }: { data: { student: any; results: any[] } }) {
  const all = data.results.filter((r) => r.course).map((r) => ({ credits: r.course.credits, gradePoint: r.grade_point }));
  const overall = calcGpa(all);
  const totalCredits = all.reduce((s, x) => s + Number(x.credits), 0);

  const semesters = new Map<number, any[]>();
  data.results.forEach((r) => {
    if (!r.course) return;
    const arr = semesters.get(r.semester) ?? [];
    arr.push(r);
    semesters.set(r.semester, arr);
  });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-hero)" }}>
        <CardContent className="p-6 text-primary-foreground">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
                <GraduationCap className="size-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-primary-foreground/80">Student</div>
                <div className="text-2xl font-semibold">{data.student.name}</div>
                <div className="text-sm text-primary-foreground/80">ID: {data.student.student_id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-primary-foreground/80">Overall GPA</div>
              <div className="text-4xl font-semibold tabular-nums">{overall.toFixed(2)}</div>
              <div className="text-xs text-primary-foreground/80">{totalCredits} credits · {all.length} subjects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Array.from(semesters.keys()).sort((a, b) => a - b).map((sem) => {
        const items = semesters.get(sem)!;
        const gpaItems = items.map((r) => ({ credits: r.course.credits, gradePoint: r.grade_point }));
        const semGpa = calcGpa(gpaItems);
        const credits = gpaItems.reduce((s, x) => s + Number(x.credits), 0);
        return (
          <Card key={sem} className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Semester {sem}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{credits} credits</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gpaBadgeClass(semGpa)}`}>GPA {semGpa.toFixed(2)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Course</th>
                    <th className="pb-2">Credits</th>
                    <th className="pb-2">Grade</th>
                    <th className="pb-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="py-2 font-mono text-xs">{r.course.code}</td>
                      <td className="py-2">{r.course.name}</td>
                      <td className="py-2">{r.course.credits}</td>
                      <td className="py-2"><span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{r.grade}</span></td>
                      <td className="py-2 tabular-nums">{Number(r.grade_point).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
