CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  credits NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  grade TEXT NOT NULL,
  grade_point NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, semester, course_id)
);

CREATE INDEX idx_results_student ON public.results(student_id);
CREATE INDEX idx_results_semester ON public.results(semester);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Open MVP: allow public read & write
CREATE POLICY "public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "public write students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "public update students" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete students" ON public.students FOR DELETE USING (true);

CREATE POLICY "public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "public write courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "public update courses" ON public.courses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete courses" ON public.courses FOR DELETE USING (true);

CREATE POLICY "public read results" ON public.results FOR SELECT USING (true);
CREATE POLICY "public write results" ON public.results FOR INSERT WITH CHECK (true);
CREATE POLICY "public update results" ON public.results FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete results" ON public.results FOR DELETE USING (true);