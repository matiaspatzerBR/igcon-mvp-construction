-- Migration: Add is_published column to tasks table
-- This column tracks whether a task is visible to foremen (Lookahead Planning)

-- 1. Add the column with a default of false
ALTER TABLE tasks 
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- 2. Migration Logic: 
-- Update all existing records to true so they remain visible in the current demo
UPDATE tasks 
SET is_published = true;
