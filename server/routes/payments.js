const express = require('express');
const store = require('../lib/store');
const config = require('../config');
const jazzcash = require('../lib/jazzcash');
const easypaisa = require('../lib/easypaisa');

const router = express.Router();

// JazzCash redirects the customer's browser here (as a POST) after payment.
router.post('/jazzcash/callback', (req, res) => {
  const body = req.body;
  const orderId = body.pp_BillReference;
  const order = store.getOrder(orderId);

  const validHash = config.jazzcash.integritySalt
    ? jazzcash.verifyCallback(body, config.jazzcash.integritySalt)
    : false;

  if (!order || !validHash) {
    return res.redirect(`/order-failed.html?reason=verification`);
  }

  const success = body.pp_ResponseCode === '000';
  order.status = success ? 'paid' : 'failed';
  order.gatewayResponse = { responseCode: body.pp_ResponseCode, message: body.pp_ResponseMessage };
  store.saveOrder(order);

  return res.redirect(success ? `/order-success.html?orderId=${order.id}` : `/order-failed.html?orderId=${order.id}`);
});

// Easypaisa redirects the customer's browser here (as a POST) after payment.
router.post('/easypaisa/callback', (req, res) => {
  const body = req.body;
  const orderId = body.orderRefNum;
  const order = store.getOrder(orderId);

  const validHash = config.easypaisa.hashKey ? easypaisa.verifyCallback(body, config.easypaisa.hashKey) : false;

  if (!order || !validHash) {
    return res.redirect(`/order-failed.html?reason=verification`);
  }

  // Easypaisa's success indicator field name can vary by product — confirm
  // the exact value against your onboarding PDF (commonly "status"/"0000").
  const success = body.status === '0000' || body.status === 'SUCCESS' || body.responseCode === '0000';
  order.status = success ? 'paid' : 'failed';
  order.gatewayResponse = body;
  store.saveOrder(order);

  return res.redirect(success ? `/order-success.html?orderId=${order.id}` : `/order-failed.html?orderId=${order.id}`);
});

module.exports = router;
