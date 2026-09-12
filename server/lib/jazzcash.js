// JazzCash Hosted Checkout Page (HCP) integration.
//
// How it works: the customer's browser is auto-submitted (via a hidden HTML
// form, see public/js/checkout.js) as a POST request straight to JazzCash's
// hosted page with these fields. JazzCash then redirects the browser back to
// pp_ReturnURL (our /api/payments/jazzcash/callback) with the result.
//
// Reference: JazzCash "Hosted Checkout Page" merchant integration guide
// (get the latest PDF from your JazzCash merchant dashboard / relationship
// manager — field names have been stable for years but always double check
// against sandbox before going live).

const crypto = require('crypto');

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function formatDateTime(date) {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

// Sorts pp_ fields alphabetically, joins their values with "&", prepends the
// Integrity Salt, then HMAC-SHA256s the result. This exact recipe is what
// JazzCash's server re-computes to verify the request/response wasn't tampered with.
function buildSecureHash(fields, integritySalt) {
  const keys = Object.keys(fields)
    .filter((k) => k.startsWith('pp_') && k !== 'pp_SecureHash' && fields[k] !== undefined && fields[k] !== '')
    .sort();
  const joined = keys.map((k) => fields[k]).join('&');
  const hashInput = `${integritySalt}&${joined}`;
  return crypto.createHmac('sha256', integritySalt).update(hashInput).digest('hex').toUpperCase();
}

function buildHostedCheckoutFields({ order, config }) {
  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour to complete payment

  const fields = {
    pp_Version: '1.1',
    pp_TxnType: '', // blank = combined menu (Card + Mobile Wallet) on JazzCash's page
    pp_Language: 'EN',
    pp_MerchantID: config.merchantId,
    pp_Password: config.password,
    pp_TxnRefNo: `T${formatDateTime(now)}${order.id.slice(-6)}`,
    pp_Amount: String(Math.round(order.total * 100)), // paisas, integer
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatDateTime(now),
    pp_BillReference: order.id,
    pp_Description: `Adorna Style order ${order.id}`,
    pp_TxnExpiryDateTime: formatDateTime(expiry),
    pp_ReturnURL: config.returnUrl,
    pp_SubMerchantID: '',
    ppmb_PhoneNo: order.customer.phone || '',
    ppmb_Email: order.customer.email || '',
  };

  fields.pp_SecureHash = buildSecureHash(fields, config.integritySalt);

  return fields;
}

// Verifies the pp_SecureHash JazzCash sends back on the callback so we know
// the result actually came from JazzCash and wasn't spoofed by a browser.
function verifyCallback(body, integritySalt) {
  const received = body.pp_SecureHash;
  if (!received) return false;
  const expected = buildSecureHash(body, integritySalt);
  return expected === received;
}

module.exports = { buildHostedCheckoutFields, verifyCallback, buildSecureHash };
