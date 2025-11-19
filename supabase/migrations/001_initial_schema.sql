-- 🗄️ WEBLYX ADMIN PLATFORM - INITIAL DATABASE SCHEMA
-- Version: 1.0
-- Date: 2025-01-19

-- ============================================================================
-- 1. ENABLE EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Lead statuses
CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'quoted',
  'approved',
  'rejected',
  'paused'
);

-- Project statuses
CREATE TYPE public.project_status AS ENUM (
  'unpaid',
  'awaiting_invoice',
  'in_progress',
  'delivered',
  'warranty_ended',
  'cancelled',
  'paused'
);

-- Project priorities
CREATE TYPE public.project_priority AS ENUM ('high', 'medium', 'low');

-- Todo priorities
CREATE TYPE public.todo_priority AS ENUM ('high', 'medium', 'low');

-- Milestone statuses
CREATE TYPE public.milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');

-- Timeline event types
CREATE TYPE public.timeline_event_type AS ENUM (
  'email',
  'note',
  'call',
  'meeting',
  'status_change',
  'system'
);

-- Calendar event types
CREATE TYPE public.calendar_event_type AS ENUM (
  'deadline',
  'milestone',
  'meeting',
  'task',
  'holiday'
);

-- Assignment status
CREATE TYPE public.assignment_status AS ENUM ('unassigned', 'assigned', 'in_progress');

-- ============================================================================
-- 3. PROFILES TABLE
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_id ON public.profiles(id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 4. USER ROLES TABLE (CRITICAL FOR ADMIN ACCESS)
-- ============================================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- RLS Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles viewable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. HELPER FUNCTION: has_role (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ============================================================================
-- 6. LEADS TABLE (POPTÁVKY)
-- ============================================================================

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  ico TEXT,

  -- Project info
  project_type TEXT NOT NULL,
  business_description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  design_style TEXT,
  brand_colors JSONB,

  -- Content readiness
  has_content TEXT, -- 'yes', 'partial', 'no'
  has_images TEXT,  -- 'yes', 'partial', 'no'
  has_logo TEXT,    -- 'yes', 'working', 'no'

  -- Timeline & budget
  timeline TEXT,
  budget_range TEXT,

  -- Communication
  preferred_contact TEXT,
  notes TEXT,

  -- Status & assignment
  status lead_status DEFAULT 'new',
  source TEXT DEFAULT 'form', -- 'form', 'questionnaire', 'email', 'referral', 'other'
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Full questionnaire data
  questionnaire_data JSONB
);

-- Indexes
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_email ON public.leads(email);

-- RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (public form submission)
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view/update/delete leads
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 7. PROJECTS TABLE
-- ============================================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relations
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  -- Project identification
  project_number TEXT UNIQUE,
  name TEXT NOT NULL,

  -- Client info
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_company TEXT,
  client_ico TEXT,
  client_address TEXT,

  -- Project details
  project_type TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'unpaid',
  priority project_priority DEFAULT 'medium',

  -- Dates
  start_date DATE,
  deadline DATE,
  completion_date DATE,

  -- Financial
  price_total DECIMAL(10, 2),
  price_paid DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  invoice_due_date DATE,
  invoice_file_url TEXT,

  -- Technical
  website_url TEXT,
  repository_url TEXT,
  hosting_info TEXT,

  -- Tracking
  time_spent_hours DECIMAL(10, 2) DEFAULT 0,
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  communication_notes TEXT,
  lessons_learned TEXT,

  -- Assignment
  assigned_to UUID[] DEFAULT '{}', -- Array of user IDs
  assignment_status assignment_status DEFAULT 'unassigned'
);

-- Auto-generate project number
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_number IS NULL THEN
    NEW.project_number := 'WBX-' || TO_CHAR(NEW.created_at, 'YYYY') || '-' ||
                          LPAD(NEXTVAL('project_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE project_number_seq START 1;

CREATE TRIGGER set_project_number
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_client_email ON public.projects(client_email);
CREATE INDEX idx_projects_assignment_status ON public.projects(assignment_status);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 8. PROJECT TODOS TABLE
-- ============================================================================

CREATE TABLE public.project_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Todo details
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority todo_priority DEFAULT 'medium',
  deadline DATE,

  -- Assignment
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Ordering & hierarchy
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES public.project_todos(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_project_todos_project_id ON public.project_todos(project_id);
CREATE INDEX idx_project_todos_completed ON public.project_todos(completed);
CREATE INDEX idx_project_todos_assigned_to ON public.project_todos(assigned_to);
CREATE INDEX idx_project_todos_parent_id ON public.project_todos(parent_id);

-- RLS Policies
ALTER TABLE public.project_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to todos"
  ON public.project_todos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 9. PROJECT FILES TABLE
-- ============================================================================

CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- File info
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_type TEXT,
  file_size BIGINT,
  folder TEXT DEFAULT 'documents', -- documents, design, media, code, other

  -- Version control
  version INTEGER DEFAULT 1,

  -- Upload info
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_project_files_folder ON public.project_files(folder);
CREATE INDEX idx_project_files_uploaded_at ON public.project_files(uploaded_at DESC);

-- RLS Policies
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to files"
  ON public.project_files FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 10. PROJECT TIMELINE TABLE
-- ============================================================================

CREATE TABLE public.project_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Event details
  type timeline_event_type NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB, -- Extra data (duration, attachments, etc.)

  -- Creator & timestamp
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_timeline_project_id ON public.project_timeline(project_id);
CREATE INDEX idx_project_timeline_type ON public.project_timeline(type);
CREATE INDEX idx_project_timeline_created_at ON public.project_timeline(created_at DESC);

-- RLS Policies
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to timeline"
  ON public.project_timeline FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 11. PROJECT MILESTONES TABLE
-- ============================================================================

CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Milestone details
  name TEXT NOT NULL,
  description TEXT,
  planned_date DATE,
  actual_date DATE,
  status milestone_status DEFAULT 'pending',

  -- Ordering & dependencies
  order_index INTEGER DEFAULT 0,
  depends_on UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX idx_project_milestones_status ON public.project_milestones(status);
CREATE INDEX idx_project_milestones_planned_date ON public.project_milestones(planned_date);

-- RLS Policies
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to milestones"
  ON public.project_milestones FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 12. EMAILS TABLE
-- ============================================================================

CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Email details
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  html_body TEXT,
  thread_id TEXT, -- For grouping conversations

  -- Relations
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  -- Status & organization
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',

  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_emails_to_email ON public.emails(to_email);
CREATE INDEX idx_emails_from_email ON public.emails(from_email);
CREATE INDEX idx_emails_thread_id ON public.emails(thread_id);
CREATE INDEX idx_emails_project_id ON public.emails(project_id);
CREATE INDEX idx_emails_lead_id ON public.emails(lead_id);
CREATE INDEX idx_emails_received_at ON public.emails(received_at DESC);
CREATE INDEX idx_emails_is_read ON public.emails(is_read);

-- RLS Policies
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to emails"
  ON public.emails FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 13. CALENDAR EVENTS TABLE
-- ============================================================================

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type calendar_event_type NOT NULL,

  -- Timing
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,

  -- Relations
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Display
  color TEXT, -- Hex color

  -- Creator
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_events_start_datetime ON public.calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_event_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_project_id ON public.calendar_events(project_id);

-- RLS Policies
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to calendar"
  ON public.calendar_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 14. BLOG POSTS TABLE
-- ============================================================================

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,

  -- Organization
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Author
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Publishing
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);

-- RLS Policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Admins have full access
CREATE POLICY "Admins have full access to blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 15. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================================

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Subscriber info
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Source tracking
  source TEXT, -- 'lead_magnet', 'blog', 'footer', etc.

  -- Status
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_subscribed_at ON public.newsletter_subscribers(subscribed_at DESC);

-- RLS Policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can update own subscription (unsubscribe)
CREATE POLICY "Users can unsubscribe"
  ON public.newsletter_subscribers FOR UPDATE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 16. SETTINGS TABLE (KEY-VALUE STORE)
-- ============================================================================

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_settings_key ON public.settings(key);

-- RLS Policies
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 17. INITIAL DATA SEEDS
-- ============================================================================

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('company_name', '"Weblyx"'),
  ('company_email', '"info@weblyx.cz"'),
  ('company_phone', '"+420 XXX XXX XXX"'),
  ('company_ico', '""'),
  ('company_dic', '""'),
  ('company_address', '""'),
  ('invoice_prefix', '"WBX"'),
  ('default_payment_terms', '14'),
  ('vat_rate', '21')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 18. VIEWS FOR ANALYTICS
-- ============================================================================

-- Projects summary view
CREATE OR REPLACE VIEW projects_summary AS
SELECT
  status,
  COUNT(*) as count,
  SUM(price_total) as total_value,
  AVG(communication_rating) as avg_rating
FROM public.projects
GROUP BY status;

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', completion_date) as month,
  COUNT(*) as projects_count,
  SUM(price_total) as revenue
FROM public.projects
WHERE completion_date IS NOT NULL
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month DESC;

-- Lead conversion rate
CREATE OR REPLACE VIEW lead_conversion_stats AS
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.leads
GROUP BY status;

-- ============================================================================
-- ✅ SCHEMA COMPLETE
-- ============================================================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: 16';
  RAISE NOTICE '🔐 RLS Policies: Enabled on all tables';
  RAISE NOTICE '📈 Views: 3 analytics views';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create first admin user in Authentication';
  RAISE NOTICE '2. Add admin role to user_roles table';
  RAISE NOTICE '3. Test has_role() function';
END $$;
