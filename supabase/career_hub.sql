-- Apply after schema.sql and production_hardening.sql.

CREATE TABLE IF NOT EXISTS public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  roadmap TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'professional')),
  why_it_matters TEXT NOT NULL DEFAULT '',
  topics TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS career_skills_path_slug_idx
  ON public.career_skills(career_path_id, slug)
  WHERE career_path_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS career_skills_professional_slug_idx
  ON public.career_skills(slug)
  WHERE career_path_id IS NULL AND category = 'professional';

CREATE TABLE IF NOT EXISTS public.skill_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_skill_id UUID NOT NULL REFERENCES public.career_skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('Tutorial', 'Documentation', 'Practice', 'Project')),
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (career_skill_id, url)
);

CREATE TABLE IF NOT EXISTS public.career_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (career_path_id, title)
);

CREATE TABLE IF NOT EXISTS public.student_career_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  selected_career_path_id UUID REFERENCES public.career_paths(id) ON DELETE SET NULL,
  headline TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  achievements TEXT[] NOT NULL DEFAULT '{}',
  internships TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  portfolio_url TEXT NOT NULL DEFAULT '',
  resume_path TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_skill_progress (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_skill_id UUID NOT NULL REFERENCES public.career_skills(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, career_skill_id)
);

CREATE TABLE IF NOT EXISTS public.student_project_progress (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_project_id UUID NOT NULL REFERENCES public.career_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'completed')),
  repository_url TEXT NOT NULL DEFAULT '',
  live_url TEXT NOT NULL DEFAULT '',
  reflection TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, career_project_id)
);

CREATE TABLE IF NOT EXISTS public.student_interview_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  communication_score INTEGER NOT NULL CHECK (communication_score BETWEEN 1 AND 5),
  clarity_score INTEGER NOT NULL CHECK (clarity_score BETWEEN 1 AND 5),
  structure_score INTEGER NOT NULL CHECK (structure_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('Internship', 'Workshop', 'Training', 'Placement drive', 'Mentorship', 'Industry project', 'Hackathon', 'Guest lecture')),
  description TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Internship', 'Placement', 'Workshop', 'Hackathon', 'Certification', 'Competition', 'Training', 'Mentorship')),
  description TEXT NOT NULL DEFAULT '',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  eligibility TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'on_campus' CHECK (mode IN ('remote', 'on_campus', 'hybrid')),
  deadline DATE,
  application_method TEXT NOT NULL DEFAULT '',
  application_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL DEFAULT 'Campus',
  description TEXT NOT NULL DEFAULT '',
  topics TEXT[] NOT NULL DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT NOT NULL DEFAULT '',
  registration_deadline TIMESTAMPTZ,
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  certificate_available BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_career_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  career_project_id UUID REFERENCES public.career_projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.career_opportunities(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(career_path_id, career_project_id, company_id, opportunity_id, workshop_id) = 1)
);

CREATE TABLE IF NOT EXISTS public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workshop_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT '',
  issued_at DATE,
  credential_url TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author_display TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Career story',
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  skills_learned TEXT[] NOT NULL DEFAULT '{}',
  project_count INTEGER NOT NULL DEFAULT 0 CHECK (project_count >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS career_paths_active_idx ON public.career_paths(is_active, category, title);
CREATE INDEX IF NOT EXISTS career_skills_path_order_idx ON public.career_skills(career_path_id, sort_order, name);
CREATE INDEX IF NOT EXISTS career_projects_path_idx ON public.career_projects(career_path_id, difficulty);
CREATE INDEX IF NOT EXISTS career_opportunities_public_idx ON public.career_opportunities(status, deadline);
CREATE INDEX IF NOT EXISTS workshops_public_idx ON public.workshops(status, starts_at);
CREATE INDEX IF NOT EXISTS companies_verification_idx ON public.companies(verification_status, name);
CREATE INDEX IF NOT EXISTS career_articles_public_idx ON public.career_articles(status, published_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS student_bookmark_path_idx ON public.student_career_bookmarks(user_id, career_path_id) WHERE career_path_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS student_bookmark_project_idx ON public.student_career_bookmarks(user_id, career_project_id) WHERE career_project_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS student_bookmark_company_idx ON public.student_career_bookmarks(user_id, company_id) WHERE company_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS student_bookmark_opportunity_idx ON public.student_career_bookmarks(user_id, opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS student_bookmark_workshop_idx ON public.student_career_bookmarks(user_id, workshop_id) WHERE workshop_id IS NOT NULL;

ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_interview_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_articles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.career_paths, public.career_skills, public.skill_resources, public.career_projects,
  public.companies, public.company_collaborations, public.career_opportunities, public.workshops,
  public.career_articles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.career_paths, public.career_skills, public.skill_resources,
  public.career_projects, public.companies, public.company_collaborations,
  public.career_opportunities, public.workshops, public.career_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_career_profiles, public.student_skill_progress,
  public.student_project_progress, public.student_interview_practice, public.student_career_bookmarks,
  public.workshop_registrations, public.certifications TO authenticated;
GRANT INSERT ON public.career_articles TO authenticated;
GRANT ALL ON public.career_paths, public.career_skills, public.skill_resources, public.career_projects,
  public.companies, public.company_collaborations, public.career_opportunities, public.workshops,
  public.workshop_registrations, public.certifications, public.career_articles TO service_role;

DROP POLICY IF EXISTS career_paths_read_active ON public.career_paths;
CREATE POLICY career_paths_read_active ON public.career_paths FOR SELECT TO authenticated
  USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS career_paths_admin_manage ON public.career_paths;
CREATE POLICY career_paths_admin_manage ON public.career_paths FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS career_skills_read ON public.career_skills;
CREATE POLICY career_skills_read ON public.career_skills FOR SELECT TO authenticated
  USING (career_path_id IS NULL OR EXISTS (SELECT 1 FROM public.career_paths p WHERE p.id = career_path_id AND (p.is_active OR public.is_admin())));
DROP POLICY IF EXISTS career_skills_admin_manage ON public.career_skills;
CREATE POLICY career_skills_admin_manage ON public.career_skills FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS skill_resources_read ON public.skill_resources;
CREATE POLICY skill_resources_read ON public.skill_resources FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.career_skills s LEFT JOIN public.career_paths p ON p.id = s.career_path_id WHERE s.id = career_skill_id AND (p.id IS NULL OR p.is_active OR public.is_admin())));
DROP POLICY IF EXISTS skill_resources_admin_manage ON public.skill_resources;
CREATE POLICY skill_resources_admin_manage ON public.skill_resources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS career_projects_read ON public.career_projects;
CREATE POLICY career_projects_read ON public.career_projects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.career_paths p WHERE p.id = career_path_id AND (p.is_active OR public.is_admin())));
DROP POLICY IF EXISTS career_projects_admin_manage ON public.career_projects;
CREATE POLICY career_projects_admin_manage ON public.career_projects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS student_career_profile_owner ON public.student_career_profiles;
CREATE POLICY student_career_profile_owner ON public.student_career_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS student_career_profile_admin_read ON public.student_career_profiles;
CREATE POLICY student_career_profile_admin_read ON public.student_career_profiles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS student_skill_progress_owner ON public.student_skill_progress;
CREATE POLICY student_skill_progress_owner ON public.student_skill_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS student_skill_progress_admin_read ON public.student_skill_progress;
CREATE POLICY student_skill_progress_admin_read ON public.student_skill_progress FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS student_project_progress_owner ON public.student_project_progress;
CREATE POLICY student_project_progress_owner ON public.student_project_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS student_project_progress_admin_read ON public.student_project_progress;
CREATE POLICY student_project_progress_admin_read ON public.student_project_progress FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS student_interview_practice_owner ON public.student_interview_practice;
CREATE POLICY student_interview_practice_owner ON public.student_interview_practice FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS student_interview_practice_admin_read ON public.student_interview_practice;
CREATE POLICY student_interview_practice_admin_read ON public.student_interview_practice FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS student_career_bookmarks_owner ON public.student_career_bookmarks;
CREATE POLICY student_career_bookmarks_owner ON public.student_career_bookmarks FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS companies_verified_read ON public.companies;
CREATE POLICY companies_verified_read ON public.companies FOR SELECT TO authenticated
  USING (verification_status = 'verified' OR public.is_admin());
DROP POLICY IF EXISTS companies_admin_manage ON public.companies;
CREATE POLICY companies_admin_manage ON public.companies FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS collaborations_verified_read ON public.company_collaborations;
CREATE POLICY collaborations_verified_read ON public.company_collaborations FOR SELECT TO authenticated
  USING (verification_status = 'verified' AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.verification_status = 'verified') OR public.is_admin());
DROP POLICY IF EXISTS collaborations_admin_manage ON public.company_collaborations;
CREATE POLICY collaborations_admin_manage ON public.company_collaborations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS career_opportunities_public_read ON public.career_opportunities;
CREATE POLICY career_opportunities_public_read ON public.career_opportunities FOR SELECT TO authenticated
  USING (status = 'published' AND (company_id IS NULL OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.verification_status = 'verified')) OR public.is_admin());
DROP POLICY IF EXISTS career_opportunities_admin_manage ON public.career_opportunities;
CREATE POLICY career_opportunities_admin_manage ON public.career_opportunities FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS workshops_public_read ON public.workshops;
CREATE POLICY workshops_public_read ON public.workshops FOR SELECT TO authenticated
  USING (status = 'published' AND (company_id IS NULL OR EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.verification_status = 'verified')) OR public.is_admin());
DROP POLICY IF EXISTS workshops_admin_manage ON public.workshops;
CREATE POLICY workshops_admin_manage ON public.workshops FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS workshop_registrations_owner_read ON public.workshop_registrations;
CREATE POLICY workshop_registrations_owner_read ON public.workshop_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS workshop_registrations_owner_register ON public.workshop_registrations;
CREATE POLICY workshop_registrations_owner_register ON public.workshop_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'registered' AND EXISTS (SELECT 1 FROM public.workshops w WHERE w.id = workshop_id AND w.status = 'published'));
DROP POLICY IF EXISTS workshop_registrations_owner_cancel ON public.workshop_registrations;
CREATE POLICY workshop_registrations_owner_cancel ON public.workshop_registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('registered', 'cancelled'))
  WITH CHECK (user_id = auth.uid() AND status IN ('registered', 'cancelled'));
DROP POLICY IF EXISTS workshop_registrations_admin_manage ON public.workshop_registrations;
CREATE POLICY workshop_registrations_admin_manage ON public.workshop_registrations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS certifications_owner_manage ON public.certifications;
CREATE POLICY certifications_owner_manage ON public.certifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND verification_status = 'pending');
DROP POLICY IF EXISTS certifications_admin_manage ON public.certifications;
CREATE POLICY certifications_admin_manage ON public.certifications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS career_articles_published_read ON public.career_articles;
CREATE POLICY career_articles_published_read ON public.career_articles FOR SELECT TO authenticated
  USING (status = 'published' OR author_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS career_articles_student_submit ON public.career_articles;
CREATE POLICY career_articles_student_submit ON public.career_articles FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND status = 'pending');
DROP POLICY IF EXISTS career_articles_admin_manage ON public.career_articles;
CREATE POLICY career_articles_admin_manage ON public.career_articles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.enforce_career_workshop_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_workshop public.workshops%ROWTYPE;
  active_registrations INTEGER;
BEGIN
  IF NEW.status <> 'registered' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO selected_workshop
  FROM public.workshops
  WHERE id = NEW.workshop_id
  FOR UPDATE;

  IF NOT FOUND OR selected_workshop.status <> 'published' THEN
    RAISE EXCEPTION 'This workshop is not open for registration.';
  END IF;
  IF selected_workshop.registration_deadline IS NOT NULL AND selected_workshop.registration_deadline <= NOW() THEN
    RAISE EXCEPTION 'Workshop registration has closed.';
  END IF;

  SELECT COUNT(*) INTO active_registrations
  FROM public.workshop_registrations
  WHERE workshop_id = NEW.workshop_id
    AND status = 'registered'
    AND id <> NEW.id;
  IF selected_workshop.capacity IS NOT NULL AND active_registrations >= selected_workshop.capacity THEN
    RAISE EXCEPTION 'This workshop has reached capacity.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS career_workshop_registration_capacity ON public.workshop_registrations;
CREATE TRIGGER career_workshop_registration_capacity
  BEFORE INSERT OR UPDATE OF status, workshop_id ON public.workshop_registrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_career_workshop_capacity();

CREATE OR REPLACE FUNCTION public.notify_students_of_career_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT
      profiles.id,
      CASE WHEN TG_TABLE_NAME = 'workshops' THEN 'Campus workshop registration is open' ELSE 'New campus career opportunity' END,
      NEW.title || CASE WHEN COALESCE(NEW.description, '') = '' THEN '' ELSE ': ' || left(NEW.description, 220) END,
      CASE WHEN TG_TABLE_NAME = 'workshops' THEN 'workshop' ELSE 'career_opportunity' END,
      '/student/career-hub'
    FROM public.profiles AS profiles
    WHERE profiles.role = 'student';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS career_opportunity_notification_event ON public.career_opportunities;
CREATE TRIGGER career_opportunity_notification_event
  AFTER INSERT OR UPDATE OF status ON public.career_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.notify_students_of_career_listing();
DROP TRIGGER IF EXISTS career_workshop_notification_event ON public.workshops;
CREATE TRIGGER career_workshop_notification_event
  AFTER INSERT OR UPDATE OF status ON public.workshops
  FOR EACH ROW EXECUTE FUNCTION public.notify_students_of_career_listing();

INSERT INTO public.career_paths (slug, title, category, summary, description, roadmap)
VALUES
  ('full-stack-developer', 'Full Stack Developer', 'Software', 'Build both the frontend and backend of web applications.', 'Full stack developers build both the frontend and backend of web applications.', ARRAY['Programming fundamentals','HTML + CSS','JavaScript','React','Backend development','Databases','APIs','Git + GitHub','Deployment','Full-stack projects']),
  ('software-developer', 'Software Developer', 'Software', 'Design, build, test, and maintain software that solves real problems.', 'Software developers turn requirements into dependable products through design, code, testing, and iteration.', ARRAY['Programming foundations','Data structures','Algorithms','Object-oriented design','Databases','Testing','Team workflows','Build a complete application']),
  ('frontend-developer', 'Frontend Developer', 'Software', 'Turn product requirements into fast, accessible interfaces.', 'Frontend developers build the user-facing parts of web products and make them clear, accessible, and responsive.', ARRAY['Web fundamentals','Semantic HTML','Responsive CSS','JavaScript','Component architecture','Accessibility','Performance','Ship a polished interface']),
  ('backend-developer', 'Backend Developer', 'Software', 'Build the APIs, data systems, and services behind applications.', 'Backend developers create services, APIs, and data systems that power products.', ARRAY['Programming foundations','HTTP and networking','API design','Data modeling','Authentication','Testing','Observability','Deploy a service']),
  ('game-developer', 'Game Developer', 'Creative technology', 'Combine programming, art, and systems design to create interactive experiences.', 'Game developers build interactive systems and experiences using code, design, and creative tools.', ARRAY['Programming foundations','Game loops','3D mathematics','Engine workflows','Physics and input','Game feel','Optimization','Publish a playable build']),
  ('ai-ml-engineer', 'AI / ML Engineer', 'Data and AI', 'Turn data into tested machine-learning systems and explain their limitations.', 'AI and machine-learning engineers prepare data, evaluate models, and build responsible systems.', ARRAY['Python and data tools','Statistics','Data preparation','Machine learning','Model evaluation','Deep learning','Responsible AI','Deploy and monitor a model']),
  ('cybersecurity-engineer', 'Cybersecurity Engineer', 'Security', 'Protect systems by understanding threats, reducing risk, and testing responsibly.', 'Security engineers assess risk, protect systems, and practice only in authorized environments.', ARRAY['Networking foundations','Linux and scripting','Threat modeling','Web security','Cryptography','Defensive monitoring','Incident response','Authorized security lab']),
  ('data-analyst', 'Data Analyst', 'Data and AI', 'Use careful analysis and clear communication to answer practical questions with data.', 'Data analysts transform data into decision-ready findings while explaining uncertainty and limitations.', ARRAY['Ask a useful question','Spreadsheet fundamentals','SQL','Data cleaning','Statistics','Visualization','Communicate findings','Publish an analysis']),
  ('cloud-engineer', 'Cloud Engineer', 'Infrastructure', 'Design secure, observable cloud infrastructure for reliable services.', 'Cloud engineers build and operate secure, resilient services on cloud platforms.', ARRAY['Linux and networking','Cloud fundamentals','Identity and access','Compute and storage','Infrastructure as code','Observability','Resilience','Deploy a secure service']),
  ('devops-engineer', 'DevOps Engineer', 'Infrastructure', 'Improve the way teams build, release, and operate software.', 'DevOps engineers improve software delivery and service reliability across teams.', ARRAY['Linux and scripting','Version control','CI pipelines','Containers','Cloud basics','Infrastructure as code','Observability','Reliable release workflow']),
  ('ui-ux-designer', 'UI/UX Designer', 'Design', 'Research user needs and turn them into coherent, accessible product experiences.', 'UI/UX designers research, prototype, and test interactions that help people complete real tasks.', ARRAY['Research and listening','Information architecture','Interaction design','Visual foundations','Prototyping','Usability testing','Accessibility','Present a case study']),
  ('mobile-app-developer', 'Mobile App Developer', 'Software', 'Create useful mobile experiences that work across devices and network conditions.', 'Mobile developers build device-aware applications with useful offline, accessible, and reliable behavior.', ARRAY['Mobile platform foundations','Layout and navigation','State and data','Networking','Offline behavior','Accessibility','Testing','Ship a mobile app']),
  ('embedded-systems-engineer', 'Embedded Systems Engineer', 'Hardware', 'Connect software to physical devices with careful attention to timing and safety.', 'Embedded engineers build software for devices where hardware, timing, and safety matter.', ARRAY['C and C++ foundations','Digital electronics','Microcontroller I/O','Timing and interrupts','Communication protocols','Embedded Linux','Testing and safety','Build a device prototype']),
  ('blockchain-developer', 'Blockchain Developer', 'Software', 'Understand distributed ledgers and build transparent, carefully scoped applications.', 'Blockchain developers build and test distributed applications with explicit security and privacy boundaries.', ARRAY['Distributed systems','Cryptographic primitives','Ledger concepts','Smart contract language','Contract testing','Wallet integration','Threat modeling','Local test deployment']),
  ('product-designer', 'Product Designer', 'Design', 'Connect user needs, product strategy, and polished interaction design.', 'Product designers connect research and strategy to tested product experiences.', ARRAY['Understand the problem','Research users','Map journeys','Prototype options','Validate decisions','Design systems','Measure outcomes','Tell the product story']),
  ('technical-writer', 'Technical Writer', 'Communication', 'Make complex systems understandable through accurate, useful documentation.', 'Technical writers help people complete tasks through clear, tested product documentation.', ARRAY['Audience and task analysis','Plain language','Information architecture','Markdown and Git','API documentation','Technical review','Accessibility','Publish documentation']),
  ('digital-marketer', 'Digital Marketer', 'Business', 'Plan and evaluate digital campaigns with a strong focus on audience and evidence.', 'Digital marketers plan useful, consent-based campaigns and measure outcomes carefully.', ARRAY['Audience research','Campaign goals','Content strategy','Search fundamentals','Analytics','Experiment design','Ethical outreach','Present campaign results'])
ON CONFLICT (slug) DO NOTHING;

WITH skill_seed(path_slug, names) AS (
  VALUES
    ('full-stack-developer', ARRAY['HTML','CSS','JavaScript','React','Node.js','Python','SQL','Git','APIs','Deployment']),
    ('software-developer', ARRAY['Python','Java','Data Structures','Algorithms','SQL','Git','Testing']),
    ('frontend-developer', ARRAY['HTML','CSS','JavaScript','React','Accessibility','Testing','Git']),
    ('backend-developer', ARRAY['Python','Node.js','SQL','APIs','Networking','Security','Docker']),
    ('game-developer', ARRAY['C#','Unity','Game Design','3D Mathematics','Game Physics','Blender','Git']),
    ('ai-ml-engineer', ARRAY['Python','Statistics','Data Processing','Machine Learning','Deep Learning','TensorFlow','PyTorch','Generative AI']),
    ('cybersecurity-engineer', ARRAY['Networking','Linux','Python','Web Security','Cryptography','Ethical Hacking','Security Tools']),
    ('data-analyst', ARRAY['Excel','SQL','Python','Statistics','Power BI','Data Visualization','Communication']),
    ('cloud-engineer', ARRAY['Linux','Networking','Docker','AWS','Azure','GCP','Security','Infrastructure as Code']),
    ('devops-engineer', ARRAY['Linux','Networking','Docker','CI/CD','Kubernetes','Git','Monitoring']),
    ('ui-ux-designer', ARRAY['User Research','Information Architecture','Wireframing','Figma','Prototyping','Accessibility','Communication']),
    ('mobile-app-developer', ARRAY['Kotlin','Swift','React Native','JavaScript','APIs','Mobile UX','Testing','Git']),
    ('embedded-systems-engineer', ARRAY['C','C++','Electronics','Microcontrollers','Embedded Linux','Networking','Testing']),
    ('blockchain-developer', ARRAY['JavaScript','Solidity','Cryptography','Smart Contracts','Testing','Web Security','Git']),
    ('product-designer', ARRAY['Product Thinking','User Research','Figma','Prototyping','Accessibility','Analytics','Communication']),
    ('technical-writer', ARRAY['Technical Writing','Information Architecture','Markdown','Git','API Documentation','Research','Editing']),
    ('digital-marketer', ARRAY['Marketing Strategy','Content Writing','SEO','Analytics','Social Media','Email Marketing','Communication'])
)
INSERT INTO public.career_skills (career_path_id, slug, name, category, why_it_matters, topics, sort_order)
SELECT p.id,
  trim(BOTH '-' FROM regexp_replace(lower(item.skill_name), '[^a-z0-9]+', '-', 'g')),
  item.skill_name,
  'technical',
  item.skill_name || ' helps ' || lower(p.title) || ' build useful, dependable work.',
  ARRAY['Core concepts and terminology','Common tools and workflows','Testing and a practical build'],
  item.position::INTEGER
FROM skill_seed seed
JOIN public.career_paths p ON p.slug = seed.path_slug
CROSS JOIN LATERAL unnest(seed.names) WITH ORDINALITY AS item(skill_name, position)
ON CONFLICT DO NOTHING;

INSERT INTO public.career_skills (career_path_id, slug, name, category, why_it_matters, topics, sort_order)
VALUES
  (NULL,'communication','Communication','professional','Communicate clearly, listen actively, and adapt to your audience.',ARRAY['Active listening','Audience awareness','Clear messages'],1),
  (NULL,'english-speaking','English Speaking','professional','Practice fluency and clear delivery in academic and professional contexts.',ARRAY['Everyday fluency','Technical vocabulary','Clear delivery'],2),
  (NULL,'public-speaking','Public Speaking','professional','Present an idea clearly and respond thoughtfully to an audience.',ARRAY['Clear opening','Signposting','Pacing and practice'],3),
  (NULL,'presentation','Presentation','professional','Organize information into a focused presentation with readable visuals.',ARRAY['Audience and purpose','Readable slides','Rehearsal and Q&A'],4),
  (NULL,'interview-skills','Interview Skills','professional','Prepare evidence-based answers and ask relevant questions.',ARRAY['Prepare examples','Structure answers','Ask thoughtful questions'],5),
  (NULL,'resume-writing','Resume Writing','professional','Describe your experience and evidence clearly for a specific opportunity.',ARRAY['Role focus','Evidence and outcomes','Editing'],6),
  (NULL,'email-writing','Email Writing','professional','Write concise, respectful messages with a clear purpose and next step.',ARRAY['Subject lines','Context and request','Follow-up'],7),
  (NULL,'teamwork','Teamwork','professional','Work reliably with others and handle different perspectives constructively.',ARRAY['Shared responsibilities','Progress updates','Constructive disagreement'],8),
  (NULL,'leadership','Leadership','professional','Help a group make progress while encouraging participation.',ARRAY['Shared direction','Inclusive participation','Reflection'],9),
  (NULL,'problem-solving','Problem Solving','professional','Define problems, compare options, and evaluate results.',ARRAY['Define the problem','Compare options','Review outcomes'],10),
  (NULL,'time-management','Time Management','professional','Plan commitments and focus effort on meaningful outcomes.',ARRAY['Prioritize outcomes','Break work into steps','Review commitments'],11),
  (NULL,'group-discussion','Group Discussion','professional','Contribute clearly and help a group reason toward a decision.',ARRAY['Build on ideas','Support claims','Invite participation'],12),
  (NULL,'professional-etiquette','Professional Etiquette','professional','Build trust through respectful, reliable professional behavior.',ARRAY['Time and boundaries','Reliable communication','Feedback'],13)
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_resources (career_skill_id, title, resource_type, url, sort_order)
SELECT s.id, resource.title, resource.resource_type, resource.url, 1
FROM public.career_skills s
JOIN (VALUES
  ('html','HTML learning guide','Tutorial','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content'),
  ('css','CSS learning guide','Tutorial','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics'),
  ('javascript','JavaScript guide','Documentation','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'),
  ('react','React Learn','Tutorial','https://react.dev/learn'),
  ('node-js','Node.js Learn','Tutorial','https://nodejs.org/en/learn'),
  ('python','Python tutorial','Documentation','https://docs.python.org/3/tutorial/'),
  ('sql','PostgreSQL tutorial','Documentation','https://www.postgresql.org/docs/current/tutorial.html'),
  ('git','Git documentation','Documentation','https://git-scm.com/doc'),
  ('c','C language reference','Documentation','https://en.cppreference.com/w/c/language.html'),
  ('c-sharp','C# documentation','Documentation','https://learn.microsoft.com/dotnet/csharp/'),
  ('unity','Unity Learn','Tutorial','https://learn.unity.com/'),
  ('tensorflow','TensorFlow tutorials','Tutorial','https://www.tensorflow.org/tutorials'),
  ('pytorch','PyTorch tutorials','Tutorial','https://pytorch.org/tutorials/'),
  ('linux','Linux Journey','Tutorial','https://linuxjourney.com/'),
  ('docker','Docker getting started','Tutorial','https://docs.docker.com/get-started/'),
  ('figma','Figma learning resources','Documentation','https://help.figma.com/hc/en-us/categories/360002051613-Get-started'),
  ('kubernetes','Kubernetes tutorials','Tutorial','https://kubernetes.io/docs/tutorials/')
) AS resource(skill_slug, title, resource_type, url) ON resource.skill_slug = s.slug
ON CONFLICT (career_skill_id, url) DO NOTHING;

INSERT INTO public.career_projects (career_path_id, title, difficulty, description, requirements)
SELECT p.id, project.title, project.difficulty, project.description, project.requirements
FROM (VALUES
  ('full-stack-developer','Personal Portfolio','Beginner','Create an accessible portfolio with responsive project pages.',ARRAY['Responsive layout','Project summaries','Contact form with validation']),
  ('full-stack-developer','College Complaint Management System','Intermediate','Build a role-aware workflow for submitting and tracking campus issues.',ARRAY['Student and admin views','Status history','Database-backed records']),
  ('full-stack-developer','Real-time Campus Management Platform','Advanced','Connect campus workflows through a secure, real-time application.',ARRAY['Authentication and authorization','Realtime updates','Monitoring and deployment']),
  ('game-developer','2D Platformer','Beginner','Build a short platforming level with a clear start and finish.',ARRAY['Player movement','Collision and checkpoints','Playable build']),
  ('game-developer','3D Survival Game','Intermediate','Prototype a small 3D survival loop with readable feedback.',ARRAY['Resource loop','Enemy behavior','Save and restart flow']),
  ('game-developer','Multiplayer Game','Advanced','Build a multiplayer prototype and document its networking model.',ARRAY['Networked session','Latency handling','Disconnect behavior']),
  ('ai-ml-engineer','Student Score Prediction','Beginner','Explore a consented dataset and establish a simple baseline.',ARRAY['Data quality notes','Baseline model','Limitations and fairness review']),
  ('ai-ml-engineer','Attendance Analysis','Intermediate','Analyze attendance trends without exposing identifiable data.',ARRAY['Privacy-aware dataset','Visual analysis','Actionable findings']),
  ('ai-ml-engineer','AI Campus Assistant','Advanced','Prototype a grounded assistant with evaluation and safe fallbacks.',ARRAY['Curated knowledge source','Evaluation set','Privacy and failure handling']),
  ('cybersecurity-engineer','Password Strength Analyzer','Beginner','Evaluate password properties locally without storing passwords.',ARRAY['No password logging','Explainable feedback','Unit tests']),
  ('cybersecurity-engineer','Network Monitoring Tool','Intermediate','Summarize traffic metadata from an authorized lab capture.',ARRAY['Lab-only data','Useful alerts','Privacy notes']),
  ('cybersecurity-engineer','Web Security Testing Lab','Advanced','Create a local vulnerable app and document defensive fixes.',ARRAY['Isolated environment','Reproducible tests','Remediation guide']),
  ('data-analyst','Campus Food Survey','Beginner','Summarize an anonymous survey and explain sampling limitations.',ARRAY['Clean dataset','Two useful charts','Written summary']),
  ('data-analyst','Attendance Analysis','Intermediate','Analyze aggregate attendance patterns with careful context.',ARRAY['SQL queries','Dashboard','Privacy safeguards']),
  ('data-analyst','Student Services Insights','Advanced','Develop a repeatable data pipeline and decision-ready report.',ARRAY['Documented pipeline','Data quality checks','Actionable report']),
  ('cloud-engineer','Static Site Deployment','Beginner','Deploy a static project with a repeatable workflow.',ARRAY['HTTPS','Build workflow','Rollback notes']),
  ('cloud-engineer','Containerized API','Intermediate','Package and deploy a small API with configuration separated.',ARRAY['Container image','Health check','Secret handling']),
  ('cloud-engineer','Resilient Service Architecture','Advanced','Document and implement a resilient, observable service.',ARRAY['Threat model','Recovery plan','Cost and scaling notes']),
  ('devops-engineer','Automated Test Pipeline','Beginner','Run tests and checks automatically on each change.',ARRAY['Fast feedback','Clear failures','Protected release branch']),
  ('devops-engineer','Container Release Workflow','Intermediate','Build and publish a versioned container through CI.',ARRAY['Reproducible image','Scanning step','Rollback instructions']),
  ('devops-engineer','Kubernetes Service Lab','Advanced','Deploy and observe a service in a local or authorized cluster.',ARRAY['Health probes','Resource limits','Incident drill']),
  ('software-developer','Student Planner','Beginner','Build a reliable planner for classes, deadlines, and tasks.',ARRAY['Create and edit tasks','Persist data','Automated tests']),
  ('software-developer','Campus Service API','Intermediate','Create a documented API for a campus workflow.',ARRAY['Input validation','Authentication','API tests']),
  ('software-developer','Open-source Contribution','Advanced','Make and document a reviewed contribution to an open-source project.',ARRAY['Reproduce an issue','Submit a focused pull request','Respond to review']),
  ('frontend-developer','Accessible Campus Directory','Beginner','Build a searchable directory for keyboard and assistive technology users.',ARRAY['Search and filters','Keyboard navigation','Responsive states']),
  ('frontend-developer','Student Services Dashboard','Intermediate','Create a data-rich dashboard with reusable interface patterns.',ARRAY['Loading and empty states','Reusable components','Accessible chart labels']),
  ('frontend-developer','Design System Starter','Advanced','Document and implement a small component library.',ARRAY['Tokens and components','Interaction states','Usage documentation']),
  ('backend-developer','Course Registration API','Beginner','Model courses and seats behind a small API.',ARRAY['CRUD endpoints','Validation','API documentation']),
  ('backend-developer','Queue and Notification Service','Intermediate','Process background work with clear retry behavior.',ARRAY['Idempotent jobs','Retry policy','Failure visibility']),
  ('backend-developer','Scalable Campus Service','Advanced','Design and load-test a service with a scaling strategy.',ARRAY['Performance baseline','Caching strategy','Operational runbook']),
  ('ui-ux-designer','Campus Wayfinding Study','Beginner','Identify navigation friction and test a low-fidelity improvement.',ARRAY['Research notes','Wireframes','Usability findings']),
  ('ui-ux-designer','Student Services Prototype','Intermediate','Design and test an end-to-end campus service flow.',ARRAY['Task flow','Interactive prototype','Accessibility review']),
  ('ui-ux-designer','Product Design Case Study','Advanced','Document a design process from problem framing to validation.',ARRAY['Evidence-based decisions','Test iterations','Portfolio narrative']),
  ('mobile-app-developer','Campus Event Companion','Beginner','Create a mobile-first view of events and reminders.',ARRAY['Responsive screens','Accessible controls','Local preferences']),
  ('mobile-app-developer','Offline Study Planner','Intermediate','Keep planning actions available with unreliable connectivity.',ARRAY['Offline storage','Sync states','Conflict handling']),
  ('mobile-app-developer','Cross-platform Campus App','Advanced','Build and test a production-style cross-platform experience.',ARRAY['Platform conventions','Crash handling','Release checklist']),
  ('embedded-systems-engineer','Sensor Data Logger','Beginner','Read a sensor and record measurements on a development board.',ARRAY['Safe voltage levels','Sampling notes','Readable output']),
  ('embedded-systems-engineer','Campus Environment Monitor','Intermediate','Build a monitor with clear data and reliability behavior.',ARRAY['Sensor calibration','Local display','Failure handling']),
  ('embedded-systems-engineer','Connected Device Prototype','Advanced','Connect a device to a service with secure update notes.',ARRAY['Protocol design','Secure credentials','Test plan']),
  ('blockchain-developer','Local Token Ledger','Beginner','Explore ledger concepts in a local, non-production environment.',ARRAY['Local network only','Basic tests','Clear limitations']),
  ('blockchain-developer','Auditable Grant Registry','Intermediate','Prototype a transparent registry with privacy boundaries.',ARRAY['Data minimization','Access rules','Threat review']),
  ('blockchain-developer','Smart Contract Security Lab','Advanced','Test common contract failure modes locally.',ARRAY['Test-only funds','Adversarial tests','Remediation notes']),
  ('product-designer','Campus Service Improvement','Beginner','Choose one service and identify a measurable user problem.',ARRAY['Problem statement','User journey','Testable concept']),
  ('product-designer','Cross-platform Product Flow','Intermediate','Design a consistent multi-device product workflow.',ARRAY['Responsive behavior','Prototype','Usability feedback']),
  ('product-designer','Product Strategy Case Study','Advanced','Connect research, prioritization, delivery, and outcome measurement.',ARRAY['Prioritization rationale','Success metric','Iteration plan']),
  ('technical-writer','Getting Started Guide','Beginner','Help a new user complete one task from setup to success.',ARRAY['Tested steps','Expected results','Troubleshooting notes']),
  ('technical-writer','API Reference','Intermediate','Document endpoints with examples and error cases.',ARRAY['Request and response examples','Authentication notes','Error reference']),
  ('technical-writer','Documentation Site','Advanced','Create a versioned documentation set for a software product.',ARRAY['Navigation structure','Review workflow','Maintenance plan']),
  ('digital-marketer','Student Club Campaign','Beginner','Plan a small campaign around a real campus event.',ARRAY['Audience and goal','Content calendar','Measurement plan']),
  ('digital-marketer','Campus Opportunity Newsletter','Intermediate','Create a consent-based newsletter and evaluate engagement.',ARRAY['Opt-in audience','Accessible content','Privacy-aware metrics']),
  ('digital-marketer','Multi-channel Campaign','Advanced','Design a campaign with clear assumptions and an evaluation loop.',ARRAY['Channel strategy','Experiment plan','Results and next steps'])
) AS project(path_slug, title, difficulty, description, requirements)
JOIN public.career_paths p ON p.slug = project.path_slug
ON CONFLICT (career_path_id, title) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('career-files', 'career-files', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS career_files_owner_read ON storage.objects;
CREATE POLICY career_files_owner_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'career-files' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS career_files_owner_upload ON storage.objects;
CREATE POLICY career_files_owner_upload ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'career-files' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS career_files_owner_update ON storage.objects;
CREATE POLICY career_files_owner_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'career-files' AND (storage.foldername(name))[1] = auth.uid()::TEXT)
  WITH CHECK (bucket_id = 'career-files' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS career_files_owner_delete ON storage.objects;
CREATE POLICY career_files_owner_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'career-files' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS career_files_admin_read ON storage.objects;
CREATE POLICY career_files_admin_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'career-files' AND public.is_admin());

NOTIFY pgrst, 'reload schema';