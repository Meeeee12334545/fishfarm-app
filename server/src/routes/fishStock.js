const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { tank_id } = req.query;
    let query = `
      SELECT fs.*, t.name as tank_name, sp.name as species_name, sp.scientific_name
      FROM fish_stock fs
      JOIN tanks t ON fs.tank_id = t.id
      JOIN fish_species sp ON fs.species_id = sp.id
    `;
    const params = [];
    if (tank_id) { query += ' WHERE fs.tank_id = ?'; params.push(tank_id); }
    query += ' ORDER BY t.name, sp.name';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT fs.*, t.name as tank_name, sp.name as species_name
      FROM fish_stock fs
      JOIN tanks t ON fs.tank_id = t.id
      JOIN fish_species sp ON fs.species_id = sp.id
      WHERE fs.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Fish stock not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { tank_id, species_id, quantity, date_added, source, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO fish_stock (tank_id, species_id, quantity, date_added, source, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tank_id, species_id, quantity, date_added || new Date().toISOString().split('T')[0], source, notes);
    db.prepare('UPDATE tanks SET current_stock = (SELECT COALESCE(SUM(quantity),0) FROM fish_stock WHERE tank_id=?) WHERE id=?').run(tank_id, tank_id);
    res.status(201).json(db.prepare('SELECT * FROM fish_stock WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tank_id, species_id, quantity, date_added, source, notes } = req.body;
    db.prepare(`
      UPDATE fish_stock SET tank_id=?, species_id=?, quantity=?, date_added=?, source=?, notes=? WHERE id=?
    `).run(tank_id, species_id, quantity, date_added, source, notes, req.params.id);
    db.prepare('UPDATE tanks SET current_stock = (SELECT COALESCE(SUM(quantity),0) FROM fish_stock WHERE tank_id=?) WHERE id=?').run(tank_id, tank_id);
    res.json(db.prepare('SELECT * FROM fish_stock WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT tank_id FROM fish_stock WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Fish stock not found' });
    db.prepare('DELETE FROM fish_stock WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE tanks SET current_stock = (SELECT COALESCE(SUM(quantity),0) FROM fish_stock WHERE tank_id=?) WHERE id=?').run(row.tank_id, row.tank_id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
