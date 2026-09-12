# Adorna Style — Online Store

A custom-coded e-commerce website for **Adorna Style** (fashion jewelry & accessories), built with:

- **Backend:** Node.js + Express
- **Frontend:** Plain HTML/CSS/JS (no build step, no framework — easy to edit)
- **Storage:** Simple JSON files (`server/data/products.json`, `server/data/orders.json`) — fine for a small catalog. Swap for a real database later if you grow.
- **Payments:** Cash on Delivery (works immediately) + JazzCash and Easypaisa hosted-checkout integration (needs your merchant credentials)

## Running it locally

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## Project structure

```
public/                 → everything the browser sees
  index.html            → home page
  shop.html             → full catalog with category filters
  product.html          → single product page
  cart.html             → shopping bag
  checkout.html         → delivery details + payment method
  order-success.html    → thank-you page
  order-failed.html     → payment failed page
  admin.html            → simple password-protected order list
  css/style.css         → all styling (rose-gold / blush brand theme)
  js/                    → cart logic, API calls, rendering
  images/products/       → product photos
  images/brand/          → logo + hero banner

server/
  index.js              → Express app entry point
  config.js             → reads settings from .env
  routes/               → API endpoints (products, orders, payments, admin)
  lib/jazzcash.js        → JazzCash Hosted Checkout Page integration
  lib/easypaisa.js       → Easypaisa Hosted Checkout integration
  data/products.json     → your 10 products (edit this to add/change products)
  data/orders.json       → incoming orders get saved here
```

## Adding / editing products

Just edit `server/data/products.json`. Each product needs: `id` (unique, no spaces), `name`, `category`, `price` (in PKR, whole numbers), `image` (path under `/images/products/`), `description`, and optional `material`. Drop the product photo into `public/images/products/`.

## Managing orders

Go to **http://localhost:3000/admin.html** and log in with the `ADMIN_TOKEN` from your `.env` file. A secure random token is already set — keep it private, and change it again if you ever suspect it's leaked. You'll see every order: customer details, items, total, payment method, and status.

Each completed order page also shows the customer a **"Confirm on WhatsApp"** button that opens a pre-filled WhatsApp message to your business number (currently `+971 54 295 7698`, set in `public/order-success.html` as `WHATSAPP_NUMBER`) — makes manual order confirmation much faster.

## Setting up real payments (JazzCash / Easypaisa)

Right now, **Cash on Delivery works out of the box** — customers can already order. JazzCash and Easypaisa need your merchant credentials before they'll work:

### JazzCash
1. Get your **Merchant ID**, **Password**, and **Integrity Salt** from your JazzCash merchant dashboard.
2. Put them in `.env`:
   ```
   JAZZCASH_MERCHANT_ID=your_merchant_id
   JAZZCASH_PASSWORD=your_password
   JAZZCASH_INTEGRITY_SALT=your_integrity_salt
   ```
3. Test with `JAZZCASH_HCP_URL` pointing at the **sandbox** URL (already the default). Place a few test orders end-to-end.
4. Once confirmed working, switch `JAZZCASH_HCP_URL` to the live URL:
   ```
   JAZZCASH_HCP_URL=https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
   ```
   and set `PAYMENT_MODE=live`.

### Easypaisa
1. Get your **Store ID** and **Hash Key** from Easypaisa, along with their integration PDF.
2. Put them in `.env`:
   ```
   EASYPAISA_STORE_ID=your_store_id
   EASYPAISA_HASH_KEY=your_hash_key
   ```
3. **Important:** open `server/lib/easypaisa.js` and compare the field names and hash formula (`buildHash`) against Easypaisa's own PDF — their exact spec can vary slightly by merchant product. Everything is in one small file, clearly commented, so it's a quick check.
4. Test thoroughly in sandbox before real customers use it.

Until credentials are added, JazzCash/Easypaisa buttons on checkout will show a friendly "not connected yet" message instead of crashing — customers can still complete their order with Cash on Delivery.

## Deploying it live (so real customers can visit it)

This is a normal Node.js app, so it can be deployed to any of these (most have a free tier):

- **Render.com** — easiest: connect your GitHub repo, it detects `npm start` automatically.
- **Railway.app** — similar, one-click deploy.
- **A VPS** (DigitalOcean, Hostinger, etc.) — run `npm install && npm start` behind a process manager like `pm2`, with Nginx in front.

Whichever you choose, remember to:
1. Set the same environment variables from `.env` in your hosting provider's dashboard (never commit `.env` to GitHub — it's already in `.gitignore`).
2. Update `BASE_URL` to your real domain (e.g. `https://adornastyle.com`) so JazzCash/Easypaisa redirect back to the right place.
3. Point your domain's DNS at the hosting provider.

### Deploying to Render.com (step by step)

1. Push this project to a GitHub repository (Render deploys from GitHub).
2. On [render.com](https://render.com), click **New → Web Service**, connect your GitHub repo.
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Under **Environment Variables**, add everything from your `.env` file (`PORT` can be left out — Render sets it automatically; just make sure `server/config.js` reading `process.env.PORT` still works, which it does).
5. Deploy. Render gives you a URL like `https://adorna-style.onrender.com` immediately — point your custom domain at it once you have one (Render's dashboard has a "Custom Domain" section with the DNS records to add).

**⚠️ Important — order data persistence:** Render's free/standard web services use an **ephemeral filesystem** — meaning `server/data/orders.json` gets wiped every time you redeploy or the service restarts. This is fine while you're still testing, but **before relying on this for real customer orders**, do one of:
- Upgrade to a Render plan with a **persistent disk** and mount it at `server/data/`, or
- Migrate order storage to a real database (Render offers a free-tier PostgreSQL instance — worth doing once you're getting regular orders).

Either way, back up `server/data/orders.json` regularly in the meantime.

## Legal pages

Draft `privacy-policy.html`, `terms.html`, and `refund-policy.html` are included (linked in every page's footer) — read through them and adjust the specifics (return window, etc.) to match how you actually want to run the business. These are commonly required during JazzCash/Easypaisa merchant approval.

## Stock management

Each product in `products.json` has an `"inStock"` field. Set it to `false` to automatically show an "Out of Stock" badge, disable the Add to Bag button everywhere, and block that item from being ordered (checked both in the browser and on the server).

## SEO — before going live

Every page has basic SEO tags (meta description, Open Graph/Twitter sharing tags, `robots.txt`, `sitemap.xml`). They currently use a **placeholder domain `adornastyle.com`** — once you buy your real domain, search-and-replace `adornastyle.com` across `public/*.html`, `public/robots.txt`, and `public/sitemap.xml` with your actual domain.

## Brand assets already included

- Logo: rose-gold "A" monogram (`public/images/brand/logo.png`)
- 10 product photos matching your live Shopify catalog (`public/images/products/`)
- A "New Arrivals" promo graphic used as the homepage hero banner

## Notes

- Prices are stored and calculated on the **server**, never trusted from the browser — so nobody can tamper with prices via the browser console.
- The cart lives in each visitor's browser (`localStorage`) — it's per-device, not shared.
- Orders are stored in `server/data/orders.json`. Back this file up regularly, or migrate to a real database once order volume grows.
