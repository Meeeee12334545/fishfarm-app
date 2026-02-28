require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tanks', require('./routes/tanks'));
app.use('/api/fish-species', require('./routes/fishSpecies'));
app.use('/api/fish-stock', require('./routes/fishStock'));
app.use('/api/health-records', require('./routes/healthRecords'));
app.use('/api/feeding-logs', require('./routes/feedingLogs'));
app.use('/api/water-quality', require('./routes/waterQuality'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/seed', require('./routes/seed'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Wide Bay Aquatics API running' }));

// Auto-seed if DB is empty
const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get();
if (staffCount.count === 0) {
  try {
    require('./routes/seed').seedData();
    console.log('Database seeded with initial data.');
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

app.listen(PORT, () => {
  console.log(`Wide Bay Aquatics API running on http://localhost:${PORT}`);
});
