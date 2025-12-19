-- Create checklist_templates table
CREATE TABLE IF NOT EXISTS checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_type TEXT NOT NULL,
    item_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for MVP)
CREATE POLICY "Allow public read access on checklist_templates" ON checklist_templates
    FOR SELECT USING (true);

-- Seed Data
INSERT INTO checklist_templates (activity_type, item_text, is_mandatory) VALUES
-- Alvenaria
('Alvenaria', 'Projeto de alvenaria disponível no local?', true),
('Alvenaria', 'Marcação (eixos) conferida e aprovada?', true),
('Alvenaria', 'Pallets de blocos e argamassa posicionados?', true),
('Alvenaria', 'Ponto de água e luz funcionando no andar?', false),

-- Instalação Elétrica
('Instalação Elétrica', 'Caixinhas 4x2 e 4x4 disponíveis?', true),
('Instalação Elétrica', 'Rasgos na alvenaria concluídos conforme projeto?', true),
('Instalação Elétrica', 'Eletrodutos e conexões em estoque?', true),

-- Pintura
('Pintura', 'Superfície (reboco/gesso) seca e lixada?', true),
('Pintura', 'Proteção de pisos e esquadrias instalada?', true),
('Pintura', 'Iluminação adequada para aplicação?', false),
('Pintura', 'Tinta na cor correta disponível?', true);
