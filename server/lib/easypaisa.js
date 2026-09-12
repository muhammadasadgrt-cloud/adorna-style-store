// Easypaisa Hosted Checkout integration.
//
// IMPORTANT: Unlike JazzCash, Easypaisa hands merchants a specific
// integration PDF when your account is approved, and the exact field names
// / hash recipe can differ slightly depending on which Easypaisa product
// you're signed up for (Open API vs classic MA channel). The version below
// follows Easypaisa's commonly published "Open API" hosted-checkout spec.
//
// BEFORE GOING LIVE: get your onboarding PDF from Easypaisa and compare it
// against buildHostedCheckoutFields() / buildHash() below — you may only
// need to tweak field names or the hash encoding (hex vs base64).
//
// How it works: same pattern as JazzCash — customer's browser is
// auto-submitted as a POST to Easypaisa's hosted page, which redirects back
// to postBackURL with the result.

const crypto = require('crypto');

function formatExpiry(date) {
  // Easypaisa expects "yyyy-MM-dd HH:mm:ss" for expiryDate in most Open API docs.
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

// Builds the HMAC-SHA256 hash Easypaisa verifies. Sorted key=value&key=value
// string (excluding the hash field itself), HMAC'd with your Hash Key,
// base64-encoded. If your onboarding PDF specifies hex instead, change
// `.digest('base64')` to `.digest('hex')` below.
function buildHash(fields, hashKey) {
  const keys = Object.keys(fields)
    .filter((k) => k !== 'merchantHashedReq' && fields[k] !== undefined && fields[k] !== '')
    .sort();
  const joined = keys.map((k) => `${k}=${fields[k]}`).join('&');
  return crypto.createHmac('sha256', hashKey).update(joined).digest('base64');
}

function buildHostedCheckoutFields({ order, config }) {
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h validity

  const fields = {
    storeId: config.storeId,
    amount: order.total.toFixed(1), // Easypaisa typically wants a decimal amount, e.g. "1490.0"
    postBackURL: config.postBackUrl,
    orderRefNum: order.id,
    expiryDate: formatExpiry(expiry),
    autoRedirect: '1',
    paymentMethod: '', // blank = let customer choose (wallet/card) on Easypaisa's page
    emailAddr: order.customer.email || '',
    mobileNum: order.customer.phone || '',
  };

  fields.merchantHashedReq = buildHash(fields, config.hashKey);

  return fields;
}

function verifyCallback(body, hashKey) {
  const received = body.merchantHashedReq;
  if (!received) return false;
  const expected = buildHash(body, hashKey);
  return expected === received;
}

module.exports = { buildHostedCheckoutFields, verifyCallback, buildHash };
