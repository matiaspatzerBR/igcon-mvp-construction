-- Migration: Create task_events table for Audit Trail
-- Purpose: Track all major actions on tasks (start, complete, release, reschedule)

CREATE TABLE task_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL, -- 'STARTED', 'COMPLETED', 'BLOCKED', 'RELEASED_MANUALLY', 'RESCHEDULED', 'COMMENT'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" 
ON task_events FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert access for authenticated users" 
ON task_events FOR INSERT 
TO authenticated 
WITH CHECK (true);

COMMENT ON TABLE task_events IS 'Audit trail for all significant task state changes and engineer overrides.';
