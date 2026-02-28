const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { tank_id, date } = req.query;
    let query = `
      SELECT fl.*, t.name as tank_name FROM feeding_logs fl JOIN tanks t ON fl.tank_id = t.id WHERE 1=1
    `;
    const params = [];
    if (tank_id) { query += ' AND fl.tank_id = ?'; params.push(tank_id); }
    if (date) { query += ' AND fl.date = ?'; params.push(date); }
    query += ' ORDER BY fl.date DESC, fl.time DESC';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT fl.*, t.name as tank_name FROM feeding_logs fl JOIN tanks t ON fl.tank_id = t.id WHERE fl.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Feeding log not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { tank_id, date, time, food_type, amount_grams, fed_by, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO feeding_logs (tank_id, date, time, food_type, amount_grams, fed_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(tank_id, date || new Date().toISOString().split('T')[0], time || new Date().toTimeString().slice(0,5), food_type, amount_grams, fed_by, notes);
    res.status(201).json(db.prepare('SELECT * FROM feeding_logs WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tank_id, date, time, food_type, amount_grams, fed_by, notes } = req.body;
    db.prepare(`
      UPDATE feeding_logs SET tank_id=?, date=?, time=?, food_type=?, amount_grams=?, fed_by=?, notes=? WHERE id=?
    `).run(tank_id, date, time, food_type, amount_grams, fed_by, notes, req.params.id);
    res.json(db.prepare('SELECT * FROM feeding_logs WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM feeding_logs WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Feeding log not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
