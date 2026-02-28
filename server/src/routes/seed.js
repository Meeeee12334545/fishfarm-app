const express = require('express');
const router = express.Router();
const db = require('../db');

function seedData() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Staff
  const staffData = [
    { name: 'John Smith', role: 'Farm Manager', email: 'john.smith@widebaaquatics.com.au', phone: '0412 345 678' },
    { name: 'Sarah Jones', role: 'Senior Aquarist', email: 'sarah.jones@widebayaquatics.com.au', phone: '0423 456 789' },
    { name: 'Tom Williams', role: 'Aquarist', email: 'tom.williams@widebayaquatics.com.au', phone: '0434 567 890' },
    { name: 'Lisa Chen', role: 'Aquarist', email: 'lisa.chen@widebayaquatics.com.au', phone: '0445 678 901' },
  ];
  const insertStaff = db.prepare('INSERT INTO staff (name, role, email, phone, active) VALUES (?, ?, ?, ?, 1)');
  staffData.forEach(s => insertStaff.run(s.name, s.role, s.email, s.phone));

  // Tanks
  const tanksData = [
    { name: 'Tank 1-A', type: 'breeding', capacity_liters: 400, status: 'active', notes: 'Clownfish breeding pairs. Maintained at 26°C with SPS coral fragments.' },
    { name: 'Tank 2-B', type: 'grow-out', capacity_liters: 600, status: 'active', notes: 'Tetra grow-out tank. Planted aquarium with soft water conditions.' },
    { name: 'Tank 3-C', type: 'quarantine', capacity_liters: 150, status: 'active', notes: 'New arrivals quarantine. 4-week isolation protocol.' },
    { name: 'Tank 4-D', type: 'display', capacity_liters: 1200, status: 'active', notes: 'Discus display tank. Pristine conditions, heated to 29°C.' },
    { name: 'Tank 5-E', type: 'breeding', capacity_liters: 300, status: 'active', notes: 'Guppy breeding colony. Multiple breeding nets installed.' },
  ];
  const insertTank = db.prepare('INSERT INTO tanks (name, type, capacity_liters, status, notes) VALUES (?, ?, ?, ?, ?)');
  tanksData.forEach(t => insertTank.run(t.name, t.type, t.capacity_liters, t.status, t.notes));

  // Fish species
  const speciesData = [
    { name: 'Common Clownfish', scientific_name: 'Amphiprion ocellaris', optimal_temp_min: 24, optimal_temp_max: 27, optimal_ph_min: 8.1, optimal_ph_max: 8.4, optimal_ammonia_max: 0.02, notes: 'Hardy marine species. Pairs bond for life.' },
    { name: 'Blue Damselfish', scientific_name: 'Chrysiptera cyanea', optimal_temp_min: 23, optimal_temp_max: 28, optimal_ph_min: 8.1, optimal_ph_max: 8.4, optimal_ammonia_max: 0.02, notes: 'Vibrant blue colouration. Can be territorial.' },
    { name: 'Coral Beauty Angelfish', scientific_name: 'Centropyge bispinosa', optimal_temp_min: 23, optimal_temp_max: 27, optimal_ph_min: 8.1, optimal_ph_max: 8.4, optimal_ammonia_max: 0.02, notes: 'Dwarf angelfish. Requires live rock for grazing.' },
    { name: 'Neon Tetra', scientific_name: 'Paracheirodon innesi', optimal_temp_min: 20, optimal_temp_max: 26, optimal_ph_min: 6.0, optimal_ph_max: 7.0, optimal_ammonia_max: 0.02, notes: 'Schooling fish. Prefers soft, acidic water. Native to South America.' },
    { name: 'Guppy', scientific_name: 'Poecilia reticulata', optimal_temp_min: 22, optimal_temp_max: 28, optimal_ph_min: 6.8, optimal_ph_max: 7.8, optimal_ammonia_max: 0.05, notes: 'Hardy livebearer. Wide variety of colour morphs available.' },
    { name: 'Betta', scientific_name: 'Betta splendens', optimal_temp_min: 24, optimal_temp_max: 30, optimal_ph_min: 6.5, optimal_ph_max: 7.5, optimal_ammonia_max: 0.02, notes: 'Siamese fighting fish. Males must be kept separate.' },
    { name: 'Discus', scientific_name: 'Symphysodon aequifasciatus', optimal_temp_min: 28, optimal_temp_max: 31, optimal_ph_min: 6.0, optimal_ph_max: 7.0, optimal_ammonia_max: 0.01, notes: 'King of the aquarium. Requires pristine water conditions and warm temps.' },
    { name: 'Goldfish', scientific_name: 'Carassius auratus', optimal_temp_min: 10, optimal_temp_max: 24, optimal_ph_min: 6.5, optimal_ph_max: 8.0, optimal_ammonia_max: 0.05, notes: 'Popular coldwater species. Produces significant waste.' },
  ];
  const insertSpecies = db.prepare('INSERT INTO fish_species (name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  speciesData.forEach(s => insertSpecies.run(s.name, s.scientific_name, s.optimal_temp_min, s.optimal_temp_max, s.optimal_ph_min, s.optimal_ph_max, s.optimal_ammonia_max, s.notes));

  // Fish stock (tank_id, species_id, quantity, source)
  const stockData = [
    { tank_id: 1, species_id: 1, quantity: 12, source: 'In-house bred', notes: '6 breeding pairs' },
    { tank_id: 1, species_id: 2, quantity: 8, source: 'Cairns Wholesale Fish', notes: 'Tank mates' },
    { tank_id: 2, species_id: 4, quantity: 80, source: 'In-house bred', notes: 'Juvenile grow-out batch #4' },
    { tank_id: 3, species_id: 3, quantity: 5, source: 'Brisbane Aquatics Wholesale', notes: 'New arrival - in quarantine' },
    { tank_id: 4, species_id: 7, quantity: 16, source: 'Premium Discus QLD', notes: 'Display breeding group' },
    { tank_id: 5, species_id: 5, quantity: 45, source: 'In-house bred', notes: 'Mixed colony inc. juveniles' },
  ];
  const insertStock = db.prepare('INSERT INTO fish_stock (tank_id, species_id, quantity, date_added, source, notes) VALUES (?, ?, ?, ?, ?, ?)');
  stockData.forEach(s => insertStock.run(s.tank_id, s.species_id, s.quantity, today, s.source, s.notes));
  // Update tank current_stock
  db.prepare('UPDATE tanks SET current_stock = (SELECT COALESCE(SUM(quantity),0) FROM fish_stock WHERE tank_id=tanks.id)').run();

  // Water quality readings
  const wqData = [
    { tank_id: 1, date: today, time: '08:00', temperature_c: 25.8, ph: 8.2, ammonia_ppm: 0.01, nitrite_ppm: 0.0, nitrate_ppm: 5.0, dissolved_oxygen: 7.8, salinity: 35.0, recorded_by: 'Sarah Jones' },
    { tank_id: 1, date: yesterday, time: '08:00', temperature_c: 25.6, ph: 8.2, ammonia_ppm: 0.01, nitrite_ppm: 0.0, nitrate_ppm: 4.8, dissolved_oxygen: 7.9, salinity: 35.0, recorded_by: 'Tom Williams' },
    { tank_id: 1, date: twoDaysAgo, time: '08:00', temperature_c: 25.9, ph: 8.1, ammonia_ppm: 0.02, nitrite_ppm: 0.0, nitrate_ppm: 5.2, dissolved_oxygen: 7.7, salinity: 35.1, recorded_by: 'Sarah Jones' },
    { tank_id: 2, date: today, time: '08:15', temperature_c: 24.2, ph: 6.5, ammonia_ppm: 0.02, nitrite_ppm: 0.0, nitrate_ppm: 8.0, dissolved_oxygen: 7.2, salinity: null, recorded_by: 'Lisa Chen' },
    { tank_id: 2, date: yesterday, time: '08:15', temperature_c: 24.0, ph: 6.4, ammonia_ppm: 0.03, nitrite_ppm: 0.0, nitrate_ppm: 7.5, dissolved_oxygen: 7.1, salinity: null, recorded_by: 'Tom Williams' },
    { tank_id: 3, date: today, time: '08:30', temperature_c: 25.0, ph: 7.8, ammonia_ppm: 0.05, nitrite_ppm: 0.02, nitrate_ppm: 12.0, dissolved_oxygen: 7.5, salinity: null, recorded_by: 'Sarah Jones', notes: 'Monitoring new arrivals - ammonia slightly elevated' },
    { tank_id: 3, date: yesterday, time: '08:30', temperature_c: 25.1, ph: 7.7, ammonia_ppm: 0.08, nitrite_ppm: 0.03, nitrate_ppm: 11.0, dissolved_oxygen: 7.4, salinity: null, recorded_by: 'Sarah Jones', notes: 'Day 2 of quarantine - ammonia elevated, added Prime' },
    { tank_id: 4, date: today, time: '08:45', temperature_c: 29.1, ph: 6.8, ammonia_ppm: 0.0, nitrite_ppm: 0.0, nitrate_ppm: 3.0, dissolved_oxygen: 7.0, salinity: null, recorded_by: 'John Smith', notes: 'Pristine conditions' },
    { tank_id: 4, date: yesterday, time: '08:45', temperature_c: 29.0, ph: 6.7, ammonia_ppm: 0.0, nitrite_ppm: 0.0, nitrate_ppm: 3.2, dissolved_oxygen: 7.1, salinity: null, recorded_by: 'Lisa Chen' },
    { tank_id: 5, date: today, time: '09:00', temperature_c: 26.5, ph: 7.2, ammonia_ppm: 0.03, nitrite_ppm: 0.0, nitrate_ppm: 15.0, dissolved_oxygen: 7.3, salinity: null, recorded_by: 'Tom Williams' },
    { tank_id: 5, date: yesterday, time: '09:00', temperature_c: 26.3, ph: 7.3, ammonia_ppm: 0.02, nitrite_ppm: 0.0, nitrate_ppm: 14.0, dissolved_oxygen: 7.4, salinity: null, recorded_by: 'Tom Williams' },
  ];
  const insertWQ = db.prepare('INSERT INTO water_quality (tank_id, date, time, temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  wqData.forEach(r => insertWQ.run(r.tank_id, r.date, r.time, r.temperature_c, r.ph, r.ammonia_ppm, r.nitrite_ppm, r.nitrate_ppm, r.dissolved_oxygen, r.salinity || null, r.recorded_by, r.notes || null));

  // Feeding logs
  const feedingData = [
    { tank_id: 1, date: today, time: '07:30', food_type: 'Frozen Mysis Shrimp', amount_grams: 5.0, fed_by: 'Sarah Jones' },
    { tank_id: 1, date: today, time: '16:30', food_type: 'Marine Pellets (Hikari)', amount_grams: 3.0, fed_by: 'Tom Williams' },
    { tank_id: 2, date: today, time: '07:45', food_type: 'Tetra Min Flakes', amount_grams: 2.5, fed_by: 'Lisa Chen' },
    { tank_id: 2, date: today, time: '16:45', food_type: 'Micro Pellets', amount_grams: 1.5, fed_by: 'Tom Williams' },
    { tank_id: 3, date: today, time: '08:00', food_type: 'Marine Flakes', amount_grams: 1.5, fed_by: 'Sarah Jones', notes: 'Light feeding during quarantine' },
    { tank_id: 4, date: today, time: '08:00', food_type: 'Beef Heart Mix', amount_grams: 10.0, fed_by: 'John Smith', notes: 'Morning feed - main meal' },
    { tank_id: 5, date: today, time: '08:15', food_type: 'Guppy Flakes', amount_grams: 2.0, fed_by: 'Lisa Chen' },
    { tank_id: 1, date: yesterday, time: '07:30', food_type: 'Frozen Mysis Shrimp', amount_grams: 5.0, fed_by: 'Tom Williams' },
    { tank_id: 2, date: yesterday, time: '07:45', food_type: 'Tetra Min Flakes', amount_grams: 2.5, fed_by: 'Sarah Jones' },
    { tank_id: 4, date: yesterday, time: '08:00', food_type: 'Beef Heart Mix', amount_grams: 10.0, fed_by: 'John Smith' },
  ];
  const insertFeeding = db.prepare('INSERT INTO feeding_logs (tank_id, date, time, food_type, amount_grams, fed_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  feedingData.forEach(f => insertFeeding.run(f.tank_id, f.date, f.time, f.food_type, f.amount_grams, f.fed_by, f.notes || null));

  // Health records
  const healthData = [
    { tank_id: 3, date: today, observation_type: 'routine', description: 'Day 3 quarantine check. Fish active and feeding well. No visible signs of disease. Continuing standard QT protocol.', treated_by: 'Sarah Jones', resolved: 0 },
    { tank_id: 3, date: yesterday, observation_type: 'routine', description: 'Day 2 quarantine. Mild stress observed, fish hiding. Added extra aeration and darkened tank sides.', treated_by: 'Sarah Jones', resolved: 0 },
    { tank_id: 1, date: twoDaysAgo, observation_type: 'treatment', description: 'Ich spots observed on 2 clownfish. Administering Cupramine treatment at 0.5ppm.', treatment: 'Cupramine 0.5ppm', treated_by: 'Sarah Jones', follow_up_date: tomorrow, resolved: 0 },
    { tank_id: 4, date: yesterday, observation_type: 'routine', description: 'All 16 discus in excellent condition. Vibrant colouration, feeding eagerly. No concerns.', treated_by: 'John Smith', resolved: 1 },
    { tank_id: 2, date: twoDaysAgo, observation_type: 'mortality', description: '3 neon tetras found dead. Suspected old age or stress from recent water change. Remaining fish healthy.', treated_by: 'Tom Williams', resolved: 1 },
    { tank_id: 5, date: yesterday, observation_type: 'routine', description: 'Guppy colony check. Several new fry observed. 3 heavily pregnant females moved to breeding nets.', treated_by: 'Lisa Chen', resolved: 1 },
  ];
  const insertHealth = db.prepare('INSERT INTO health_records (tank_id, date, observation_type, description, treatment, treated_by, follow_up_date, resolved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  healthData.forEach(h => insertHealth.run(h.tank_id, h.date, h.observation_type, h.description, h.treatment || null, h.treated_by, h.follow_up_date || null, h.resolved));

  // Inventory
  const inventoryData = [
    { name: 'Hikari Marine Pellets', category: 'food', quantity: 2.5, unit: 'kg', reorder_level: 1.0, supplier: 'Aquarium Industries QLD', cost_per_unit: 45.00 },
    { name: 'Tetra Min Flakes', category: 'food', quantity: 0.8, unit: 'kg', reorder_level: 0.5, supplier: 'Aquarium Industries QLD', cost_per_unit: 32.00 },
    { name: 'Frozen Mysis Shrimp', category: 'food', quantity: 3.0, unit: 'kg', reorder_level: 1.0, supplier: 'Reef Nutrition Aust', cost_per_unit: 28.00 },
    { name: 'Beef Heart Mix (frozen)', category: 'food', quantity: 5.0, unit: 'kg', reorder_level: 2.0, supplier: 'Local butcher / in-house', cost_per_unit: 8.00 },
    { name: 'Guppy Flakes', category: 'food', quantity: 0.3, unit: 'kg', reorder_level: 0.5, supplier: 'Aquarium Industries QLD', cost_per_unit: 18.00, notes: 'REORDER NEEDED' },
    { name: 'Cupramine', category: 'medication', quantity: 250, unit: 'ml', reorder_level: 100, supplier: 'Seachem Australia', cost_per_unit: 35.00 },
    { name: 'Seachem Prime', category: 'chemical', quantity: 2, unit: 'L', reorder_level: 0.5, supplier: 'Seachem Australia', cost_per_unit: 42.00 },
    { name: 'API Melafix', category: 'medication', quantity: 200, unit: 'ml', reorder_level: 100, supplier: 'API Fishcare', cost_per_unit: 22.00 },
    { name: 'Reef Salt (Instant Ocean)', category: 'chemical', quantity: 10, unit: 'kg', reorder_level: 5, supplier: 'Coral Sea Aquatics Bundaberg', cost_per_unit: 3.50 },
    { name: 'pH Down (Sodium Bisulphate)', category: 'chemical', quantity: 1.0, unit: 'kg', reorder_level: 0.25, supplier: 'Aqua-Tech QLD', cost_per_unit: 15.00 },
    { name: 'Aquarium Filter Media (sponge)', category: 'equipment', quantity: 12, unit: 'units', reorder_level: 4, supplier: 'Aquarium Industries QLD', cost_per_unit: 4.50 },
    { name: 'Air Pump Diaphragms', category: 'equipment', quantity: 6, unit: 'units', reorder_level: 3, supplier: 'Marine Tech QLD', cost_per_unit: 12.00 },
    { name: 'Test Kit Reagents (API Master)', category: 'equipment', quantity: 2, unit: 'kits', reorder_level: 1, supplier: 'API Fishcare', cost_per_unit: 65.00 },
    { name: 'Activated Carbon', category: 'chemical', quantity: 2.0, unit: 'kg', reorder_level: 0.5, supplier: 'Aqua-Tech QLD', cost_per_unit: 18.00 },
    { name: 'Heater (300W)', category: 'equipment', quantity: 2, unit: 'units', reorder_level: 1, supplier: 'Marine Tech QLD', cost_per_unit: 85.00 },
  ];
  const insertInventory = db.prepare('INSERT INTO inventory (name, category, quantity, unit, reorder_level, supplier, cost_per_unit, last_updated, notes) VALUES (?, ?, ?, ?, ?, ?, ?, date(\'now\'), ?)');
  inventoryData.forEach(i => insertInventory.run(i.name, i.category, i.quantity, i.unit, i.reorder_level, i.supplier, i.cost_per_unit, i.notes || null));

  // Tasks
  const tasksData = [
    { title: 'Morning water quality check', description: 'Test all tanks: pH, ammonia, nitrite, nitrate, temperature', priority: 'high', status: 'completed', due_date: today, assigned_to: 'Sarah Jones' },
    { title: 'Cupramine treatment follow-up - Tank 1-A', description: 'Check clownfish ich treatment progress. Test copper levels. Document results.', priority: 'critical', status: 'in_progress', due_date: today, assigned_to: 'Sarah Jones', tank_id: 1 },
    { title: 'Quarantine day 3 observation', description: 'Perform full health assessment on new Coral Beauty arrivals in Tank 3-C', priority: 'high', status: 'pending', due_date: today, assigned_to: 'Sarah Jones', tank_id: 3 },
    { title: 'Reorder guppy flakes', description: 'Stock level critical. Order minimum 2kg from Aquarium Industries QLD', priority: 'high', status: 'pending', due_date: today, assigned_to: 'John Smith' },
    { title: 'Weekly tank glass cleaning', description: 'Scrape algae from all tank glass. Use algae scraper.', priority: 'medium', status: 'pending', due_date: tomorrow, assigned_to: 'Tom Williams' },
    { title: 'Water change - Tank 4-D (Discus)', description: '30% water change. Use RO water aged at 29°C. Dechlorinate.', priority: 'high', status: 'pending', due_date: tomorrow, assigned_to: 'John Smith', tank_id: 4 },
    { title: 'Filter maintenance - Tank 2-B', description: 'Clean sponge filters in aquarium water (not tap). Replace activated carbon.', priority: 'medium', status: 'pending', due_date: tomorrow, assigned_to: 'Lisa Chen', tank_id: 2 },
    { title: 'Monthly equipment inspection', description: 'Check all heaters, pumps, lights, airstones. Replace worn diaphragms.', priority: 'medium', status: 'pending', due_date: nextWeek, assigned_to: 'Tom Williams' },
    { title: 'Guppy fry separation', description: 'Separate new guppy fry from adults in Tank 5-E to grow-out container', priority: 'medium', status: 'pending', due_date: tomorrow, assigned_to: 'Lisa Chen', tank_id: 5 },
    { title: 'Prepare quarterly stock report', description: 'Compile fish stock numbers, mortality rates, breeding success for Q4 report', priority: 'low', status: 'pending', due_date: nextWeek, assigned_to: 'John Smith' },
  ];
  const insertTask = db.prepare('INSERT INTO tasks (title, description, priority, status, due_date, assigned_to, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  tasksData.forEach(t => insertTask.run(t.title, t.description, t.priority, t.status, t.due_date, t.assigned_to, t.tank_id || null));

  // Alerts
  const alertsData = [
    { type: 'health', severity: 'critical', message: 'Tank 1-A: Ich (Cryptocaryon irritans) detected on 2 Clownfish. Treatment in progress with Cupramine.', tank_id: 1 },
    { type: 'water_quality', severity: 'warning', message: 'Tank 3-C: Ammonia elevated at 0.05 ppm. New arrivals in quarantine - monitor closely.', tank_id: 3 },
    { type: 'inventory', severity: 'warning', message: 'Guppy Flakes stock critically low (0.3kg remaining, reorder level 0.5kg). Reorder required.' },
    { type: 'task', severity: 'warning', message: 'Critical task overdue: Cupramine treatment follow-up for Tank 1-A.', tank_id: 1 },
    { type: 'feeding', severity: 'info', message: 'All tanks fed this morning. Afternoon feeding schedule due at 16:30.' },
  ];
  const insertAlert = db.prepare('INSERT INTO alerts (type, severity, message, tank_id, resolved) VALUES (?, ?, ?, ?, 0)');
  alertsData.forEach(a => insertAlert.run(a.type, a.severity, a.message, a.tank_id || null));
}

router.post('/', (req, res) => {
  try {
    // Clear existing data
    ['alerts','tasks','inventory','health_records','feeding_logs','water_quality','fish_stock','fish_species','tanks','staff'].forEach(t => {
      db.prepare(`DELETE FROM ${t}`).run();
    });
    seedData();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.seedData = seedData;
