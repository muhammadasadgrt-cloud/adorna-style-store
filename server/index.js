const express = require('express');
const path = require('path');
const config = require('./config');

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // gateway callbacks arrive form-encoded

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(config.port, () => {
  console.log(`Adorna Style running at http://localhost:${config.port}`);
  console.log(`Payment mode: ${config.paymentMode}`);
  console.log(`JazzCash configured: ${config.jazzcash.isConfigured()}`);
  console.log(`Easypaisa configured: ${config.easypaisa.isConfigured()}`);
});
