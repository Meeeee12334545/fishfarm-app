const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { tank_id, observation_type, resolved } = req.query;
    let query = `
      SELECT hr.*, t.name as tank_name
      FROM health_records hr
      JOIN tanks t ON hr.tank_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (tank_id) { query += ' AND hr.tank_id = ?'; params.push(tank_id); }
    if (observation_type) { query += ' AND hr.observation_type = ?'; params.push(observation_type); }
    if (resolved !== undefined) { query += ' AND hr.resolved = ?'; params.push(resolved === 'true' ? 1 : 0); }
    query += ' ORDER BY hr.date DESC, hr.id DESC';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT hr.*, t.name as tank_name FROM health_records hr JOIN tanks t ON hr.tank_id = t.id WHERE hr.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Health record not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { tank_id, fish_stock_id, date, observation_type, description, treatment, treated_by, follow_up_date, resolved } = req.body;
    const result = db.prepare(`
      INSERT INTO health_records (tank_id, fish_stock_id, date, observation_type, description, treatment, treated_by, follow_up_date, resolved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tank_id, fish_stock_id, date || new Date().toISOString().split('T')[0], observation_type, description, treatment, treated_by, follow_up_date, resolved ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM health_records WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tank_id, fish_stock_id, date, observation_type, description, treatment, treated_by, follow_up_date, resolved } = req.body;
    db.prepare(`
      UPDATE health_records SET tank_id=?, fish_stock_id=?, date=?, observation_type=?, description=?, treatment=?, treated_by=?, follow_up_date=?, resolved=?
      WHERE id=?
    `).run(tank_id, fish_stock_id, date, observation_type, description, treatment, treated_by, follow_up_date, resolved ? 1 : 0, req.params.id);
    res.json(db.prepare('SELECT * FROM health_records WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM health_records WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Health record not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
