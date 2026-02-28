const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { resolved, type, severity } = req.query;
    let query = 'SELECT a.*, t.name as tank_name FROM alerts a LEFT JOIN tanks t ON a.tank_id = t.id WHERE 1=1';
    const params = [];
    if (resolved !== undefined) { query += ' AND a.resolved = ?'; params.push(resolved === 'true' ? 1 : 0); }
    if (type) { query += ' AND a.type = ?'; params.push(type); }
    if (severity) { query += ' AND a.severity = ?'; params.push(severity); }
    query += ' ORDER BY CASE a.severity WHEN \'critical\' THEN 0 WHEN \'warning\' THEN 1 ELSE 2 END, a.created_at DESC';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { type, severity, message, tank_id } = req.body;
    const result = db.prepare('INSERT INTO alerts (type, severity, message, tank_id) VALUES (?, ?, ?, ?)').run(type, severity, message, tank_id);
    res.status(201).json(db.prepare('SELECT * FROM alerts WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/resolve', (req, res) => {
  try {
    db.prepare('UPDATE alerts SET resolved = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM alerts WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
