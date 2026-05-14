import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, GaugeCircle, Sparkles, ArrowUpRight } from "lucide-react";
import { calcGpa, gpaBadgeClass } from "@/lib/gpa";

export const Route = createFileRoute("/")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <Dashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [s, c, r] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase
          .from("results")
          .select("credits:course_id, grade_point, course:courses(credits)")
          .limit(5000),
      ]);
      const rows = (r.data ?? []) as { grade_point: number; course: { credits: number } | null }[];
      const items = rows
        .filter((x) => x.course)
        .map((x) => ({ credits: x.course!.credits, gradePoint: x.grade_point }));
      const overall = items.length ? calcGpa(items) : 0;
      return {
        students: s.count ?? 0,
        courses: c.count ?? 0,
        results: rows.length,
        overall,
      };
    },
  });

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-2xl border border-border/60 p-8 text-primary-foreground shadow-sm"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="size-3.5" /> Result processing made simple
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Compute semester GPAs in seconds
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
              Drop an Excel file with student results and we handle parsing, validation,
              deduplication, and GPA calculation across semesters.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-foreground hover:bg-white/90"
              >
                <Link to="/upload">Upload results</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/results">
                  Browse results <ArrowUpRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Students" value={isLoading ? null : data!.students} />
        <StatCard icon={BookOpen} label="Courses" value={isLoading ? null : data!.courses} />
        <StatCard icon={Sparkles} label="Result rows" value={isLoading ? null : data!.results} />
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GaugeCircle className="size-4" /> Avg GPA (all results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-semibold tracking-tight">
                  {data!.overall.toFixed(2)}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${gpaBadgeClass(data!.overall)}`}
                >
                  {data!.overall >= 3.7
                    ? "Excellent"
                    : data!.overall >= 3.0
                      ? "Good"
                      : data!.overall >= 2.0
                        ? "Average"
                        : "Needs work"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <Step
            n={1}
            title="Download template"
            desc="Use the standard Excel template with the required columns."
          />
          <Step
            n={2}
            title="Upload results"
            desc="Drag and drop your .xlsx file. Duplicates are skipped automatically."
          />
          <Step
            n={3}
            title="View GPAs"
            desc="Check semester-wise and overall GPAs from the Results page."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
      <div className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </div>
      <div className="mt-3 font-medium">{title}</div>
      <div className="mt-1 text-muted-foreground">{desc}</div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number | null;
}) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" /> {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}
