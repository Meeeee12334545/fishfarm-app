const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY category, name';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/low-stock', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM inventory WHERE reorder_level IS NOT NULL AND quantity <= reorder_level ORDER BY name').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, quantity, unit, reorder_level, supplier, cost_per_unit, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO inventory (name, category, quantity, unit, reorder_level, supplier, cost_per_unit, last_updated, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, date('now'), ?)
    `).run(name, category, quantity, unit, reorder_level, supplier, cost_per_unit, notes);
    res.status(201).json(db.prepare('SELECT * FROM inventory WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, category, quantity, unit, reorder_level, supplier, cost_per_unit, notes } = req.body;
    db.prepare(`
      UPDATE inventory SET name=?, category=?, quantity=?, unit=?, reorder_level=?, supplier=?, cost_per_unit=?, last_updated=date('now'), notes=?
      WHERE id=?
    `).run(name, category, quantity, unit, reorder_level, supplier, cost_per_unit, notes, req.params.id);
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
