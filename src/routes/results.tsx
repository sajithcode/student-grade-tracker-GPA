import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calcGpa, gpaBadgeClass } from "@/lib/gpa";

export const Route = createFileRoute("/results")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <ResultsPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

const PAGE_SIZE = 10;

function ResultsPage() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["all-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select(
          "id, semester, grade, grade_point, student:students(id, student_id, name), course:courses(code, name, credits)",
        )
        .order("semester", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const semesters = useMemo(() => {
    const set = new Set<number>();
    (data ?? []).forEach((r) => set.add(r.semester));
    return Array.from(set).sort((a, b) => a - b);
  }, [data]);

  // Group by student
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        studentDbId: string;
        studentId: string;
        name: string;
        semesters: Map<number, { credits: number; gradePoint: number }[]>;
        all: { credits: number; gradePoint: number }[];
      }
    >();
    (data ?? []).forEach((r: any) => {
      if (!r.student || !r.course) return;
      const key = r.student.student_id;
      if (!map.has(key)) {
        map.set(key, {
          studentDbId: r.student.id,
          studentId: r.student.student_id,
          name: r.student.name,
          semesters: new Map(),
          all: [],
        });
      }
      const entry = map.get(key)!;
      const item = { credits: r.course.credits, gradePoint: r.grade_point };
      entry.all.push(item);
      const arr = entry.semesters.get(r.semester) ?? [];
      arr.push(item);
      entry.semesters.set(r.semester, arr);
    });
    return Array.from(map.values());
  }, [data]);

  const filtered = useMemo(() => {
    return grouped.filter((g) => {
      const matchSearch =
        !search ||
        g.studentId.toLowerCase().includes(search.toLowerCase()) ||
        g.name.toLowerCase().includes(search.toLowerCase());
      const matchSem = semester === "all" || g.semesters.has(Number(semester));
      return matchSearch && matchSem;
    });
  }, [grouped, search, semester]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCsv = () => {
    const header = ["Student ID", "Name", "Overall GPA", "Total Credits", "Semesters"];
    const lines = [header.join(",")];
    filtered.forEach((g) => {
      const totalCredits = g.all.reduce((s, x) => s + Number(x.credits), 0);
      const gpa = calcGpa(g.all).toFixed(2);
      lines.push(
        [
          g.studentId,
          `"${g.name}"`,
          gpa,
          totalCredits,
          Array.from(g.semesters.keys()).sort().join("|"),
        ].join(","),
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gpa-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="text-sm text-muted-foreground">
            Search students, filter by semester, view GPAs.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by student ID or name..."
                className="pl-9"
              />
            </div>
            <Select
              value={semester}
              onValueChange={(v) => {
                setSemester(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Semesters</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Overall GPA</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td colSpan={5} className="px-4 py-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No results yet.{" "}
                      <Link to="/upload" className="text-primary underline">
                        Upload an Excel file
                      </Link>{" "}
                      to begin.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((g) => {
                    const gpa = calcGpa(g.all);
                    const totalCredits = g.all.reduce((s, x) => s + Number(x.credits), 0);
                    return (
                      <tr
                        key={g.studentId}
                        className="border-t border-border/60 hover:bg-secondary/40"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{g.name}</div>
                          <div className="text-xs text-muted-foreground">{g.studentId}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {Array.from(g.semesters.keys())
                            .sort((a, b) => a - b)
                            .map((s) => (
                              <span
                                key={s}
                                className="mr-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs"
                              >
                                S{s}
                              </span>
                            ))}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{totalCredits}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${gpaBadgeClass(gpa)}`}
                          >
                            {gpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild size="sm" variant="ghost">
                            <Link to="/students/$studentId" params={{ studentId: g.studentId }}>
                              View <ExternalLink className="ml-1 size-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {filtered.length} student{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span>
                Page {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
