require('dotenv').config();

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

module.exports = {
  port: process.env.PORT || 3000,
  baseUrl,
  paymentMode: process.env.PAYMENT_MODE || 'sandbox',
  adminToken: process.env.ADMIN_TOKEN || '',
  jazzcash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
    password: process.env.JAZZCASH_PASSWORD || '',
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || '',
    hcpUrl:
      process.env.JAZZCASH_HCP_URL ||
      'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
    returnUrl: `${baseUrl}/api/payments/jazzcash/callback`,
    isConfigured() {
      return Boolean(this.merchantId && this.password && this.integritySalt);
    },
  },
  easypaisa: {
    storeId: process.env.EASYPAISA_STORE_ID || '',
    hashKey: process.env.EASYPAISA_HASH_KEY || '',
    hcpUrl: process.env.EASYPAISA_HCP_URL || 'https://easypay.easypaisa.com.pk/easypay/Index.jsf',
    postBackUrl: `${baseUrl}/api/payments/easypaisa/callback`,
    isConfigured() {
      return Boolean(this.storeId && this.hashKey);
    },
  },
};
