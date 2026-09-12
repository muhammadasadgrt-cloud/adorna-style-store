function productCardHTML(product) {
  const outOfStock = product.inStock === false;
  return `
    <div class="product-card">
      <a href="/product.html?id=${encodeURIComponent(product.id)}" class="thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${outOfStock ? '<span class="stock-badge">Out of Stock</span>' : ''}
      </a>
      <div class="info">
        <span class="category-label">${product.category}</span>
        <h3><a href="/product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
        <div class="price">${formatPKR(product.price)}</div>
        <button class="btn btn-outline add-btn" data-add-to-cart="${product.id}" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
      </div>
    </div>
  `;
}

function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = `<div class="empty-state"><span class="emoji">🔍</span><p>No products found in this category yet.</p></div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join('');
  container.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(btn.dataset.addToCart, 1);
      showToast('Added to your bag ✨');
    });
  });
}
