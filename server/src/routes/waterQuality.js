const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { tank_id, limit } = req.query;
    let query = `
      SELECT wq.*, t.name as tank_name FROM water_quality wq JOIN tanks t ON wq.tank_id = t.id WHERE 1=1
    `;
    const params = [];
    if (tank_id) { query += ' AND wq.tank_id = ?'; params.push(tank_id); }
    query += ' ORDER BY wq.date DESC, wq.time DESC';
    if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/latest', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT wq.*, t.name as tank_name, t.type as tank_type
      FROM water_quality wq
      JOIN tanks t ON wq.tank_id = t.id
      WHERE wq.id IN (
        SELECT id FROM water_quality wq2 WHERE wq2.tank_id = wq.tank_id ORDER BY date DESC, time DESC LIMIT 1
      )
      ORDER BY t.name
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM water_quality WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Record not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { tank_id, date, time, temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO water_quality (tank_id, date, time, temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tank_id, date || new Date().toISOString().split('T')[0], time || new Date().toTimeString().slice(0,5), temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes);
    res.status(201).json(db.prepare('SELECT * FROM water_quality WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tank_id, date, time, temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes } = req.body;
    db.prepare(`
      UPDATE water_quality SET tank_id=?, date=?, time=?, temperature_c=?, ph=?, ammonia_ppm=?, nitrite_ppm=?, nitrate_ppm=?, dissolved_oxygen=?, salinity=?, recorded_by=?, notes=?
      WHERE id=?
    `).run(tank_id, date, time, temperature_c, ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, dissolved_oxygen, salinity, recorded_by, notes, req.params.id);
    res.json(db.prepare('SELECT * FROM water_quality WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM water_quality WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
