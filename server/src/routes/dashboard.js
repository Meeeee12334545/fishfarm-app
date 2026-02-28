const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalTanks = db.prepare('SELECT COUNT(*) as count FROM tanks').get().count;
    const activeTanks = db.prepare("SELECT COUNT(*) as count FROM tanks WHERE status = 'active'").get().count;
    const totalFish = db.prepare('SELECT COALESCE(SUM(current_stock),0) as total FROM tanks').get().total;
    const todayFeedings = db.prepare('SELECT COUNT(*) as count FROM feeding_logs WHERE date = ?').get(today).count;
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'").get().count;
    const activeAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE resolved = 0').get().count;
    const unresolvedHealth = db.prepare("SELECT COUNT(*) as count FROM health_records WHERE resolved = 0 AND observation_type IN ('illness','treatment')").get().count;
    const lowStockItems = db.prepare('SELECT COUNT(*) as count FROM inventory WHERE reorder_level IS NOT NULL AND quantity <= reorder_level').get().count;

    const alerts = db.prepare(`
      SELECT a.*, t.name as tank_name FROM alerts a LEFT JOIN tanks t ON a.tank_id = t.id
      WHERE a.resolved = 0 ORDER BY CASE a.severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END, a.created_at DESC LIMIT 10
    `).all();

    const recentHealth = db.prepare(`
      SELECT hr.*, t.name as tank_name FROM health_records hr JOIN tanks t ON hr.tank_id = t.id
      WHERE hr.resolved = 0 ORDER BY hr.date DESC LIMIT 5
    `).all();

    const todayTasks = db.prepare(`
      SELECT t.*, tk.name as tank_name FROM tasks t LEFT JOIN tanks tk ON t.tank_id = tk.id
      WHERE t.status != 'completed' AND (t.due_date <= ? OR t.due_date IS NULL)
      ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END LIMIT 8
    `).all(today);

    const latestWaterQuality = db.prepare(`
      SELECT wq.*, t.name as tank_name FROM water_quality wq
      JOIN tanks t ON wq.tank_id = t.id
      WHERE wq.id IN (
        SELECT id FROM water_quality WHERE tank_id = wq.tank_id ORDER BY date DESC, time DESC LIMIT 1
      )
      ORDER BY t.name
    `).all();

    res.json({
      stats: { totalTanks, activeTanks, totalFish, todayFeedings, pendingTasks, activeAlerts, unresolvedHealth, lowStockItems },
      alerts,
      recentHealth,
      todayTasks,
      latestWaterQuality,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
