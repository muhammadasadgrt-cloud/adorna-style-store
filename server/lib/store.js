// Very small file-based "database" for orders. Fine for a low-volume store
// with a handful of orders a day. If Adorna Style grows a lot, swap this
// for a real database (SQLite/Postgres) without changing the route code much.

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'orders.json');

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getProducts() {
  return readJson(PRODUCTS_PATH, []);
}

function getProduct(id) {
  return getProducts().find((p) => p.id === id) || null;
}

function getOrders() {
  return readJson(ORDERS_PATH, []);
}

function getOrder(id) {
  return getOrders().find((o) => o.id === id) || null;
}

function saveOrder(order) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  writeJson(ORDERS_PATH, orders);
  return order;
}

module.exports = {
  getProducts,
  getProduct,
  getOrders,
  getOrder,
  saveOrder,
};
