const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { status, priority, assigned_to, tank_id } = req.query;
    let query = 'SELECT t.*, tk.name as tank_name FROM tasks t LEFT JOIN tanks tk ON t.tank_id = tk.id WHERE 1=1';
    const params = [];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (assigned_to) { query += ' AND t.assigned_to = ?'; params.push(assigned_to); }
    if (tank_id) { query += ' AND t.tank_id = ?'; params.push(tank_id); }
    query += ' ORDER BY CASE t.priority WHEN \'critical\' THEN 0 WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 ELSE 3 END, t.due_date ASC';
    res.json(db.prepare(query).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT t.*, tk.name as tank_name FROM tasks t LEFT JOIN tanks tk ON t.tank_id = tk.id WHERE t.id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Task not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, description, priority, status, due_date, assigned_to, tank_id } = req.body;
    const result = db.prepare(`
      INSERT INTO tasks (title, description, priority, status, due_date, assigned_to, tank_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, priority || 'medium', status || 'pending', due_date, assigned_to, tank_id);
    res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { title, description, priority, status, due_date, assigned_to, tank_id, completed_at } = req.body;
    const resolvedCompletedAt = status === 'completed' ? (completed_at || new Date().toISOString()) : null;
    db.prepare(`
      UPDATE tasks SET title=?, description=?, priority=?, status=?, due_date=?, assigned_to=?, tank_id=?, completed_at=?
      WHERE id=?
    `).run(title, description, priority, status, due_date, assigned_to, tank_id, resolvedCompletedAt, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
