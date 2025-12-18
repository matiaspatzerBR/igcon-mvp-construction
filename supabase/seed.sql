-- SEED DATA CORREGIDO (UUIDs Válidos)

-- 1. USERS (Profiles)
-- Prefijo usado: a0ee... (Válido)
INSERT INTO profiles (id, name, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Engenheiro', 'engenheiro'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marcos Mestre', 'mestre'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'João Operário', 'operario'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Ana Estagiária', 'estagiario');

-- 2. PROJECTS
-- Prefijo cambiado: 'p' -> 'f' (f0ee...)
INSERT INTO projects (id, name) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Residencial Horizonte');

-- 3. ZONES (Torre A -> Pavimentos -> Unidades)
-- Prefijo cambiado: 'z' -> 'c' (c1ee... c2ee... c3ee...)
-- Torre A
INSERT INTO zones (id, parent_id, name, type) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NULL, 'Torre A', 'Torre');

-- Pavimentos (1 to 3)
INSERT INTO zones (id, parent_id, name, type) VALUES
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '1º Andar', 'Pavimento'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2º Andar', 'Pavimento'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '3º Andar', 'Pavimento');

-- Unidades (Aptos)
-- 1º Andar
INSERT INTO zones (id, parent_id, name, type) VALUES
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apto 101', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apto 102', 'Unidade');
-- 2º Andar
INSERT INTO zones (id, parent_id, name, type) VALUES
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Apto 201', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Apto 202', 'Unidade');
-- 3º Andar
INSERT INTO zones (id, parent_id, name, type) VALUES
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Apto 301', 'Unidade'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Apto 302', 'Unidade');

-- 4. ACTIVITY TEMPLATES
-- Prefijo cambiado: 't' -> 'd' (d1ee...)
INSERT INTO activity_templates (id, name, estimated_duration, standard_crew_size, sequence_order) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Alvenaria', 40, 3, 1),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Instalação Elétrica', 16, 2, 2),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Reboco', 32, 3, 3),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Pintura', 24, 2, 4);

-- 5. MATERIALS DB
-- Prefijo cambiado: 'm' -> 'e' (e1ee...)
INSERT INTO materials_db (id, name, unit) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'Bloco Cerâmico', 'un'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Cimento', 'sc'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Areia', 'm3'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Fio 2.5mm', 'm'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'Tinta Acrílica', 'l');

-- 6. TEMPLATE CHECKLISTS
-- Referenciando los nuevos IDs 'd1ee...'
INSERT INTO template_checklists (template_id, type, item_description) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PRE_START', 'Projeto de alvenaria disponível?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PRE_START', 'Marcação (eixos) conferida?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PRE_START', 'Pallets de blocos no andar?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'QUALITY_CLOSE', 'Prumo e nível conferidos?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'QUALITY_CLOSE', 'Limpeza do local realizada?');

INSERT INTO template_checklists (template_id, type, item_description) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'PRE_START', 'Caixinhas 4x2 disponíveis?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'PRE_START', 'Rasgos na alvenaria concluídos?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'QUALITY_CLOSE', 'Tubulação desobstruída?'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'QUALITY_CLOSE', 'Caixinhas niveladas?');

-- 7. TASKS (Seeding various states for Heatmap)
-- Prefijo de tarea cambiado: 'k' -> 'f' (f1ee...)
-- Note: Todas las referencias (project, template, zone) han sido actualizadas a los nuevos IDs

-- Apto 101: Advanced
-- Alvenaria: Verified Closed (Green)
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'verified_closed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Elétrica: Completed Pending Verify (Blue)
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'completed_pending_verify', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Reboco: In Progress (Yellow)
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'in_progress', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- Apto 102: Issues
-- Alvenaria: Rework Needed (Red)
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'rework_needed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Elétrica: Blocked (Red)
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'blocked', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- Apto 201: Just Starting
-- Alvenaria: Ready
INSERT INTO tasks (id, project_id, template_id, zone_id, status, assigned_user_id) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'ready', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- 8. CONSTRAINTS
-- Reference task 'f1ee...44'
INSERT INTO constraints (task_id, description, status) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Falta de eletrodutos na obra', 'open');