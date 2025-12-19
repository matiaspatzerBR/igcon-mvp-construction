-- Migration: Ensure Zone deletions cascade correctly to tasks
-- Note: This is a safety measure to ensure no orphan tasks remain when a unit (zone) is deleted.

-- 1. Alter tasks table to cascade delete when a zone is removed
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_zone_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_zone_id_fkey
FOREIGN KEY (zone_id) REFERENCES zones(id)
ON DELETE CASCADE;
