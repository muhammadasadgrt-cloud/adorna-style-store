const express = require('express');
const store = require('../lib/store');
const config = require('../config');

const router = express.Router();

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!config.adminToken) {
    return res.status(503).json({ error: 'Admin panel not configured (set ADMIN_TOKEN in .env).' });
  }
  if (token !== config.adminToken) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  next();
}

router.get('/orders', requireAdmin, (req, res) => {
  const orders = store.getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

module.exports = router;
