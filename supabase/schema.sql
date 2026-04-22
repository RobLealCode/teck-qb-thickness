-- ============================================================
-- TECK QB — Medición de Espesores MWS
-- Schema Supabase (PostgreSQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS stations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  location    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspections (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id       UUID REFERENCES stations(id) ON DELETE CASCADE,
  report_number    TEXT,
  inspector        TEXT,
  inspection_date  DATE NOT NULL,
  result           TEXT DEFAULT 'ACEPTADO',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipe_lines (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id        UUID REFERENCES inspections(id) ON DELETE CASCADE,
  tag                  TEXT NOT NULL,
  diameter_inches      TEXT,
  element_type         TEXT,  -- STRAIGHT | ELBOW_90 | TEE | REDUCER | LAUNCHER
  nominal_thickness_mm NUMERIC,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS measurements (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipe_line_id  UUID REFERENCES pipe_lines(id) ON DELETE CASCADE,
  ring_number   TEXT,
  angle_degrees INTEGER NOT NULL,  -- 0, 45, 90, 135, 180, 225, 270, 315
  thickness_mm  NUMERIC NOT NULL,
  measured_at   DATE NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_station ON inspections(station_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_inspection ON pipe_lines(inspection_id);
CREATE INDEX IF NOT EXISTS idx_measurements_pipeline ON measurements(pipe_line_id);
CREATE INDEX IF NOT EXISTS idx_measurements_angle ON measurements(angle_degrees);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE stations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipe_lines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden leer y escribir todo
CREATE POLICY "auth_all_stations"    ON stations    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_inspections" ON inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_pipelines"   ON pipe_lines  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_measurements" ON measurements FOR ALL TO authenticated USING (true) WITH CHECK (true);
