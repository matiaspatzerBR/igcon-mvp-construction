-- Migration: Add Sectors (Macro-Zonas) and update Zone/Task assignments

-- 1. Create Sectors table
CREATE TABLE sectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  default_foreman_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Zones table
ALTER TABLE zones 
ADD COLUMN sector_id UUID REFERENCES sectors(id),
ADD COLUMN responsible_foreman_id UUID REFERENCES profiles(id);

-- 3. Seed Initial Sectors
INSERT INTO sectors (name) VALUES ('Torre 1'), ('Torre 2');

-- 4. Migration Logic: Assign existing zones to 'Torre 1'
DO $$
DECLARE
    torre1_id UUID;
BEGIN
    SELECT id INTO torre1_id FROM sectors WHERE name = 'Torre 1' LIMIT 1;
    UPDATE zones SET sector_id = torre1_id WHERE sector_id IS NULL;
END $$;

-- 5. Enable RLS for sectors
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON sectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all access for authenticated users" ON sectors FOR ALL TO authenticated USING (true); -- Simplified for MVP
