const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM staff ORDER BY name').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const s = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ error: 'Staff not found' });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, role, email, phone, active } = req.body;
    const result = db.prepare('INSERT INTO staff (name, role, email, phone, active) VALUES (?, ?, ?, ?, ?)').run(name, role, email, phone, active !== undefined ? (active ? 1 : 0) : 1);
    res.status(201).json(db.prepare('SELECT * FROM staff WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, role, email, phone, active } = req.body;
    db.prepare('UPDATE staff SET name=?, role=?, email=?, phone=?, active=? WHERE id=?').run(name, role, email, phone, active ? 1 : 0, req.params.id);
    const s = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ error: 'Staff not found' });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Staff not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
