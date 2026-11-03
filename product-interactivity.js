document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.querySelector('.cart-drawer');
  const items = document.querySelector('#cart-items');
  const count = document.querySelector('#cart-count');
  const titleCount = document.querySelector('#cart-title-count');
  const total = document.querySelector('#cart-total');
  const cart = [];
  const money = (value) => `KSh ${value.toLocaleString('en-KE')}`;
  const render = () => {
    if (count) count.textContent = cart.length;
    if (titleCount) titleCount.textContent = `(${cart.length})`;
    if (total) total.textContent = money(cart.reduce((sum, product) => sum + product.price, 0));
    if (!items) return;
    items.innerHTML = cart.length ? cart.map((product, index) => `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><p>${money(product.price)}</p></div><button type="button" data-remove="${index}" aria-label="Remove ${product.name}">×</button></div>`).join('') : '<p class="empty-cart">Your bag is waiting for a good pair.</p>';
    items.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { cart.splice(Number(button.dataset.remove), 1); render(); }));
  };
  const setDrawer = (open) => { if (!drawer) return; drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open)); if (open) drawer.querySelector('.cart-close')?.focus(); };
  document.querySelectorAll('.cart-trigger').forEach((button) => button.addEventListener('click', (event) => { if (drawer) { event.preventDefault(); setDrawer(true); } }));
  drawer?.querySelector('.cart-close')?.addEventListener('click', () => setDrawer(false));
  drawer?.querySelector('.cart-backdrop')?.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });
  document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => { const card = button.closest('.product-card'); const image = card?.querySelector('img'); if (!card) return; cart.push({ name: card.dataset.productName, price: Number(card.dataset.productPrice), image: image?.getAttribute('src') || '' }); render(); setDrawer(true); }));
  document.querySelectorAll('.mobile-nav-toggle').forEach((toggle) => toggle.addEventListener('click', () => { const nav = document.querySelector('.main-nav'); const isOpen = nav?.classList.toggle('open') || false; toggle.setAttribute('aria-expanded', String(isOpen)); }));
  render();
});
