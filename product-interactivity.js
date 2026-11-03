document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.querySelector('.cart-drawer');
  const items = document.querySelector('#cart-items');
  const count = document.querySelector('#cart-count');
  const titleCount = document.querySelector('#cart-title-count');
  const total = document.querySelector('#cart-total');
  const openButtons = document.querySelectorAll('.cart-trigger');
  const closeButton = document.querySelector('.cart-close');
  const backdrop = document.querySelector('.cart-backdrop');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.main-nav');
  const cart = [];

  const money = (value) => `KSh ${value.toLocaleString('en-KE')}`;
  const render = () => {
    count.textContent = cart.length;
    titleCount.textContent = `(${cart.length})`;
    total.textContent = money(cart.reduce((sum, product) => sum + product.price, 0));
    if (!cart.length) {
      items.innerHTML = '<p class="empty-cart">Your bag is waiting for a good pair.</p>';
      return;
    }
    items.innerHTML = cart.map((product, index) => `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><p>${money(product.price)}</p></div><button type="button" data-remove="${index}" aria-label="Remove ${product.name}">×</button></div>`).join('');
    items.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { cart.splice(Number(button.dataset.remove), 1); render(); }));
  };
  const setDrawer = (open) => { drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open)); if (open) closeButton.focus(); };
  openButtons.forEach((button) => button.addEventListener('click', () => setDrawer(true)));
  closeButton.addEventListener('click', () => setDrawer(false));
  backdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });
  document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('.product-card');
    cart.push({ name: card.dataset.productName, price: Number(card.dataset.productPrice), image: card.querySelector('img').src });
    render(); setDrawer(true);
  }));
  mobileToggle.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); mobileToggle.setAttribute('aria-expanded', String(isOpen)); });
  render();
});
