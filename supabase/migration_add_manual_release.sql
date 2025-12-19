-- Migration: Add manual_release column to tasks
-- Purpose: Allow engineers to force-unblock tasks regardless of predecessors

ALTER TABLE tasks 
ADD COLUMN manual_release BOOLEAN DEFAULT false;

COMMENT ON COLUMN tasks.manual_release IS 'If true, task can be started even if predecessors are not finished (Force Release)';
