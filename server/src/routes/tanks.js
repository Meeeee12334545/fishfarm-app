const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const tanks = db.prepare('SELECT * FROM tanks ORDER BY name').all();
    res.json(tanks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const tank = db.prepare('SELECT * FROM tanks WHERE id = ?').get(req.params.id);
    if (!tank) return res.status(404).json({ error: 'Tank not found' });
    const stock = db.prepare(`
      SELECT fs.*, sp.name as species_name, sp.scientific_name
      FROM fish_stock fs
      JOIN fish_species sp ON fs.species_id = sp.id
      WHERE fs.tank_id = ?
    `).all(req.params.id);
    const latestWQ = db.prepare(`
      SELECT * FROM water_quality WHERE tank_id = ? ORDER BY date DESC, time DESC LIMIT 1
    `).get(req.params.id);
    res.json({ ...tank, stock, latestWQ });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, type, capacity_liters, current_stock, status, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO tanks (name, type, capacity_liters, current_stock, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, type, capacity_liters, current_stock || 0, status || 'active', notes);
    const tank = db.prepare('SELECT * FROM tanks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tank);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, type, capacity_liters, current_stock, status, notes } = req.body;
    db.prepare(`
      UPDATE tanks SET name=?, type=?, capacity_liters=?, current_stock=?, status=?, notes=?
      WHERE id=?
    `).run(name, type, capacity_liters, current_stock, status, notes, req.params.id);
    const tank = db.prepare('SELECT * FROM tanks WHERE id = ?').get(req.params.id);
    if (!tank) return res.status(404).json({ error: 'Tank not found' });
    res.json(tank);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tanks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Tank not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
