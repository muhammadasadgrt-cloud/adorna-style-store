const Api = {
  async getProducts(category) {
    const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
    const res = await fetch(url);
    return res.json();
  },
  async getProduct(id) {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return res.json();
  },
  async createOrder(payload) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Something went wrong');
      err.data = data;
      throw err;
    }
    return data;
  },
  async getOrder(id) {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return res.json();
  },
};

function formatPKR(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-PK');
}

// Auto-submits a hidden form to a payment gateway's hosted checkout page.
// `fields` is a flat object of form field name -> value.
function submitToGateway(actionUrl, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
