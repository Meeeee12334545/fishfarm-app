const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM fish_species ORDER BY name').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const sp = db.prepare('SELECT * FROM fish_species WHERE id = ?').get(req.params.id);
    if (!sp) return res.status(404).json({ error: 'Species not found' });
    res.json(sp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO fish_species (name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes);
    res.status(201).json(db.prepare('SELECT * FROM fish_species WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes } = req.body;
    db.prepare(`
      UPDATE fish_species SET name=?, scientific_name=?, optimal_temp_min=?, optimal_temp_max=?, optimal_ph_min=?, optimal_ph_max=?, optimal_ammonia_max=?, notes=?
      WHERE id=?
    `).run(name, scientific_name, optimal_temp_min, optimal_temp_max, optimal_ph_min, optimal_ph_max, optimal_ammonia_max, notes, req.params.id);
    const sp = db.prepare('SELECT * FROM fish_species WHERE id = ?').get(req.params.id);
    if (!sp) return res.status(404).json({ error: 'Species not found' });
    res.json(sp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM fish_species WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Species not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
