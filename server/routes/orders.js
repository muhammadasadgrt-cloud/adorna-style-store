const express = require('express');
const { nanoid } = require('nanoid');
const store = require('../lib/store');
const config = require('../config');
const jazzcash = require('../lib/jazzcash');
const easypaisa = require('../lib/easypaisa');

const router = express.Router();

const VALID_PAYMENT_METHODS = ['cod', 'jazzcash', 'easypaisa'];

router.post('/', (req, res) => {
  const { customer, items, paymentMethod } = req.body || {};

  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
    return res.status(400).json({ error: 'Please fill in your name, phone, address and city.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Please choose a valid payment method.' });
  }

  // Re-price everything server-side from the product catalog — never trust
  // prices sent from the browser.
  const lineItems = [];
  let total = 0;
  for (const item of items) {
    const product = store.getProduct(item.id);
    if (!product) {
      return res.status(400).json({ error: `Product "${item.id}" no longer exists.` });
    }
    if (product.inStock === false) {
      return res.status(400).json({ error: `"${product.name}" is currently out of stock.` });
    }
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const lineTotal = product.price * qty;
    total += lineTotal;
    lineItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      lineTotal,
    });
  }

  const order = {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      city: customer.city,
      notes: customer.notes || '',
    },
    items: lineItems,
    total,
    currency: 'PKR',
    paymentMethod,
    status: paymentMethod === 'cod' ? 'pending_cod' : 'awaiting_payment',
  };

  let gateway = null;

  if (paymentMethod === 'jazzcash') {
    if (!config.jazzcash.isConfigured()) {
      return res.status(409).json({
        error:
          'JazzCash is not connected yet on this store. Please choose Cash on Delivery, or contact the store owner.',
        gatewayNotConfigured: true,
      });
    }
    const fields = jazzcash.buildHostedCheckoutFields({ order, config: config.jazzcash });
    gateway = { actionUrl: config.jazzcash.hcpUrl, fields };
  }

  if (paymentMethod === 'easypaisa') {
    if (!config.easypaisa.isConfigured()) {
      return res.status(409).json({
        error:
          'Easypaisa is not connected yet on this store. Please choose Cash on Delivery, or contact the store owner.',
        gatewayNotConfigured: true,
      });
    }
    const fields = easypaisa.buildHostedCheckoutFields({ order, config: config.easypaisa });
    gateway = { actionUrl: config.easypaisa.hcpUrl, fields };
  }

  store.saveOrder(order);

  res.status(201).json({
    orderId: order.id,
    total: order.total,
    paymentMethod: order.paymentMethod,
    gateway,
  });
});

router.get('/:id', (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  // Don't leak the full customer record to a public endpoint — just enough
  // for the order-success page to show a summary.
  res.json({
    id: order.id,
    createdAt: order.createdAt,
    items: order.items,
    total: order.total,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
  });
});

module.exports = router;
