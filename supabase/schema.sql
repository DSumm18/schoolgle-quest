-- Schoolgle Quest Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE school_type AS ENUM ('primary', 'secondary', 'special');
CREATE TYPE creature_type AS ENUM ('hr', 'finance', 'estates', 'gdpr', 'compliance', 'teaching', 'send');
CREATE TYPE quest_type AS ENUM ('maths', 'spelling', 'reading', 'local_knowledge', 'exploration', 'collection');
CREATE TYPE quest_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE quest_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE objective_type AS ENUM ('visit_location', 'answer_question', 'collect_item', 'defeat_creature');
CREATE TYPE item_type AS ENUM ('consumable', 'equipment', 'quest_item', 'collectible');
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE location_type AS ENUM ('park', 'library', 'playground', 'museum', 'historic_site');
CREATE TYPE building_type AS ENUM ('main_building', 'classroom', 'library', 'gym', 'cafeteria', 'office');

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    school_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SCHOOLS
-- =====================================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    type school_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for geospatial queries
CREATE INDEX idx_schools_location ON schools USING GIST(location);
CREATE INDEX idx_schools_postcode ON schools(postcode);

-- =====================================================
-- PLAYER PROGRESS
-- =====================================================

CREATE TABLE player_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- INVENTORY
-- =====================================================

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_progress_id UUID NOT NULL REFERENCES player_progress(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type item_type NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    rarity item_rarity NOT NULL DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_player ON inventory_items(player_progress_id);

-- =====================================================
-- QUESTS
-- =====================================================

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type quest_type NOT NULL,
    difficulty quest_difficulty NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    required_level INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    school_id UUID REFERENCES schools(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quests_school ON quests(school_id);
CREATE INDEX idx_quests_type ON quests(type);

-- =====================================================
-- QUEST OBJECTIVES
-- =====================================================

CREATE TABLE quest_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    type objective_type NOT NULL,
    target INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_objectives_quest ON quest_objectives(quest_id);

-- =====================================================
-- PLAYER QUEST PROGRESS
-- =====================================================

CREATE TABLE player_quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_progress_id UUID NOT NULL REFERENCES player_progress(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status quest_status NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_progress_id, quest_id)
);

CREATE INDEX idx_player_quest_progress ON player_quest_progress(player_progress_id);

-- =====================================================
-- OBJECTIVE PROGRESS
-- =====================================================

CREATE TABLE objective_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_quest_progress_id UUID NOT NULL REFERENCES player_quest_progress(id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES quest_objectives(id) ON DELETE CASCADE,
    current INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(player_quest_progress_id, objective_id)
);

CREATE INDEX idx_objective_progress ON objective_progress(player_quest_progress_id);

-- =====================================================
-- CREATURES
-- =====================================================

CREATE TABLE creatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type creature_type NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    health INTEGER NOT NULL,
    max_health INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    model_url TEXT,
    abilities JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_creatures_type ON creatures(type);

-- =====================================================
-- LOCATIONS
-- =====================================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type location_type NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    postcode VARCHAR(10),
    safety_rating INTEGER NOT NULL DEFAULT 5 CHECK (safety_rating >= 1 AND safety_rating <= 10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_location ON locations USING GIST(location);
CREATE INDEX idx_locations_type ON locations(type);

-- =====================================================
-- QUEST LOCATIONS (Many-to-Many)
-- =====================================================

CREATE TABLE quest_locations (
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    PRIMARY KEY (quest_id, location_id)
);

-- =====================================================
-- WORLD DATA
-- =====================================================

CREATE TABLE world_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    postcode VARCHAR(10) NOT NULL,
    terrain_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id)
);

-- =====================================================
-- BUILDINGS
-- =====================================================

CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_data_id UUID NOT NULL REFERENCES world_data(id) ON DELETE CASCADE,
    type building_type NOT NULL,
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,
    position_z DECIMAL(10, 2) NOT NULL,
    size_x DECIMAL(10, 2) NOT NULL,
    size_y DECIMAL(10, 2) NOT NULL,
    size_z DECIMAL(10, 2) NOT NULL,
    color VARCHAR(7),
    texture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_buildings_world ON buildings(world_data_id);

-- =====================================================
-- WORLD CREATURES (Creatures spawned in worlds)
-- =====================================================

CREATE TABLE world_creatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_data_id UUID NOT NULL REFERENCES world_data(id) ON DELETE CASCADE,
    creature_id UUID NOT NULL REFERENCES creatures(id) ON DELETE CASCADE,
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,
    position_z DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_world_creatures ON world_creatures(world_data_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_progress_updated_at BEFORE UPDATE ON player_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_quest_progress_updated_at BEFORE UPDATE ON player_quest_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_creatures ENABLE ROW LEVEL SECURITY;

-- Policies (basic examples - customize as needed)

-- Users can read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Players can read and update their own progress
CREATE POLICY player_progress_own ON player_progress
    FOR ALL
    USING (auth.uid() = user_id);

-- Everyone can read schools
CREATE POLICY schools_select_all ON schools
    FOR SELECT
    TO authenticated
    USING (true);

-- Everyone can read quests
CREATE POLICY quests_select_all ON quests
    FOR SELECT
    TO authenticated
    USING (true);

-- Teachers can create quests
CREATE POLICY quests_insert_teachers ON quests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('teacher', 'admin')
        )
    );

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert a sample school
INSERT INTO schools (name, postcode, address, latitude, longitude, location, type)
VALUES (
    'Demo Primary School',
    'LS19 7XB',
    '123 School Lane, Leeds',
    53.8950,
    -1.6740,
    ST_SetSRID(ST_MakePoint(-1.6740, 53.8950), 4326),
    'primary'
);

-- Insert sample creatures
INSERT INTO creatures (name, type, level, health, max_health, attack, defense, abilities)
VALUES
    ('HR Guardian', 'hr', 1, 100, 100, 15, 10, '["interview", "policy-check"]'),
    ('Budget Beast', 'finance', 1, 80, 80, 20, 8, '["audit", "budget-cut"]'),
    ('Facilities Phantom', 'estates', 1, 120, 120, 18, 15, '["maintenance", "security"]'),
    ('Data Demon', 'gdpr', 1, 90, 90, 25, 12, '["data-breach", "compliance"]');
