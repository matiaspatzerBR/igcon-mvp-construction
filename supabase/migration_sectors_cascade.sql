-- Migration: Ensure Sector and Zone deletions cascade correctly

-- 1. Alter zones table to cascade delete when a sector is removed
ALTER TABLE zones
DROP CONSTRAINT IF EXISTS zones_sector_id_fkey;

ALTER TABLE zones
ADD CONSTRAINT zones_sector_id_fkey
FOREIGN KEY (sector_id) REFERENCES sectors(id)
ON DELETE CASCADE;

-- 2. Alter tasks table to cascade delete when a zone is removed
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_zone_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_zone_id_fkey
FOREIGN KEY (zone_id) REFERENCES zones(id)
ON DELETE CASCADE;
