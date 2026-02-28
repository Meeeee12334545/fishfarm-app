const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'fishfarm.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS tanks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('breeding','grow-out','quarantine','display')),
    capacity_liters REAL,
    current_stock INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','maintenance','empty')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fish_species (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    scientific_name TEXT,
    optimal_temp_min REAL,
    optimal_temp_max REAL,
    optimal_ph_min REAL,
    optimal_ph_max REAL,
    optimal_ammonia_max REAL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS fish_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_id INTEGER NOT NULL REFERENCES tanks(id),
    species_id INTEGER NOT NULL REFERENCES fish_species(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    date_added TEXT NOT NULL DEFAULT (date('now')),
    source TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_id INTEGER NOT NULL REFERENCES tanks(id),
    fish_stock_id INTEGER REFERENCES fish_stock(id),
    date TEXT NOT NULL DEFAULT (date('now')),
    observation_type TEXT NOT NULL CHECK(observation_type IN ('routine','illness','treatment','mortality')),
    description TEXT NOT NULL,
    treatment TEXT,
    treated_by TEXT,
    follow_up_date TEXT,
    resolved INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feeding_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_id INTEGER NOT NULL REFERENCES tanks(id),
    date TEXT NOT NULL DEFAULT (date('now')),
    time TEXT NOT NULL,
    food_type TEXT NOT NULL,
    amount_grams REAL,
    fed_by TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS water_quality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_id INTEGER NOT NULL REFERENCES tanks(id),
    date TEXT NOT NULL DEFAULT (date('now')),
    time TEXT NOT NULL,
    temperature_c REAL,
    ph REAL,
    ammonia_ppm REAL,
    nitrite_ppm REAL,
    nitrate_ppm REAL,
    dissolved_oxygen REAL,
    salinity REAL,
    recorded_by TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('food','medication','equipment','chemical')),
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    reorder_level REAL,
    supplier TEXT,
    cost_per_unit REAL,
    last_updated TEXT NOT NULL DEFAULT (date('now')),
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed')),
    due_date TEXT,
    assigned_to TEXT,
    tank_id INTEGER REFERENCES tanks(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('health','water_quality','inventory','feeding','task')),
    severity TEXT NOT NULL CHECK(severity IN ('info','warning','critical')),
    message TEXT NOT NULL,
    tank_id INTEGER REFERENCES tanks(id),
    resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
