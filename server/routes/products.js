const express = require('express');
const store = require('../lib/store');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let products = store.getProducts();
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = store.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
