-- Migration: Create pollution_reports table, status history table, and RLS policies
-- File: supabase/migrations/20260814120000_create_pollution_reports.sql

-- 1. Create pollution_reports table
CREATE TABLE IF NOT EXISTS public.pollution_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    city TEXT,
    region TEXT,
    country TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    issue_category TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    health_problems TEXT[],
    image_path TEXT,
    video_path TEXT,
    report_date TIMESTAMPTZ DEFAULT NOW(),
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    ai_classification TEXT,
    ai_confidence DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pollution_reports_user_id ON public.pollution_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_pollution_reports_status ON public.pollution_reports(status);
CREATE INDEX IF NOT EXISTS idx_pollution_reports_report_id ON public.pollution_reports(report_id);

-- 3. Create pollution_report_status_history table
CREATE TABLE IF NOT EXISTS public.pollution_report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pollution_report_status_history_report_id ON public.pollution_report_status_history(report_id);

-- 4. Enable Row Level Security
ALTER TABLE public.pollution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollution_report_status_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for pollution_reports
CREATE POLICY "Users can view own pollution reports"
    ON public.pollution_reports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pollution reports"
    ON public.pollution_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pollution reports"
    ON public.pollution_reports
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pollution reports"
    ON public.pollution_reports
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for status history
CREATE POLICY "Users can view status history of own reports"
    ON public.pollution_report_status_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pollution_reports
            WHERE pollution_reports.report_id = pollution_report_status_history.report_id
            AND pollution_reports.user_id = auth.uid()
        )
    );

-- 7. Trigger to automatically record status history on creation
CREATE OR REPLACE FUNCTION public.handle_new_pollution_report()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.pollution_report_status_history (report_id, old_status, new_status, changed_by, note)
    VALUES (NEW.report_id, NULL, NEW.status, NEW.user_id, 'Initial report submission');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_pollution_report_created
    AFTER INSERT ON public.pollution_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_pollution_report();

-- 8. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('pollution-report-evidence', 'pollution-report-evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload report evidence"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'pollution-report-evidence');

CREATE POLICY "Authenticated users can view report evidence"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'pollution-report-evidence');
