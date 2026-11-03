document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.querySelector('.cart-drawer')
  const items = document.querySelector('#cart-items')
  const count = document.querySelector('#cart-count')
  const titleCount = document.querySelector('#cart-title-count')
  const total = document.querySelector('#cart-total')
  const cards = [...document.querySelectorAll('.product-card')]
  const money = (value) => `KSh ${value.toLocaleString('en-KE')}`
  const cart = []

  cards.forEach((card) => {
    const name = card.dataset.productName?.toLowerCase() || ''
    const category = name.includes('boot') || name.includes('jungle') || name.includes('field') ? 'boots' : name.includes('clarks') ? 'formal' : 'sneakers'
    card.dataset.category = category
    const meta = card.querySelector('.product-meta')
    if (meta && !card.querySelector('[data-size]')) {
      const label = document.createElement('label')
      label.className = 'size-picker'
      label.innerHTML = 'Size <select data-size aria-label="Select size"><option value="39">39</option><option value="40">40</option><option value="41" selected>41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option></select>'
      meta.append(label)
    }
  })

  const render = () => {
    if (count) count.textContent = cart.length
    if (titleCount) titleCount.textContent = `(${cart.length})`
    if (total) total.textContent = money(cart.reduce((sum, product) => sum + product.price, 0))
    if (!items) return
    items.innerHTML = cart.length ? cart.map((product, index) => `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><p>${money(product.price)} · Size ${product.size}</p></div><button type="button" data-remove="${index}" aria-label="Remove ${product.name}">×</button></div>`).join('') : '<p class="empty-cart">Your bag is waiting for a good pair.</p>'
    items.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { cart.splice(Number(button.dataset.remove), 1); render() }))
  }

  const setDrawer = (open) => {
    if (!drawer) return
    drawer.classList.toggle('open', open)
    drawer.setAttribute('aria-hidden', String(!open))
    if (open) drawer.querySelector('.cart-close')?.focus()
  }

  document.querySelectorAll('.cart-trigger').forEach((button) => button.addEventListener('click', (event) => {
    if (drawer) { event.preventDefault(); setDrawer(true) }
  }))
  drawer?.querySelector('.cart-close')?.addEventListener('click', () => setDrawer(false))
  drawer?.querySelector('.cart-backdrop')?.addEventListener('click', () => setDrawer(false))
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false) })

  document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('.product-card')
    const image = card?.querySelector('img')
    if (!card) return
    cart.push({ name: card.dataset.productName, price: Number(card.dataset.productPrice), image: image?.getAttribute('src') || '', size: card.querySelector('[data-size]')?.value || '41' })
    render()
    setDrawer(true)
  }))

  const search = document.querySelector('[data-product-search]')
  const category = document.querySelector('[data-product-category]')
  const sort = document.querySelector('[data-product-sort]')
  const results = document.querySelector('[data-results-count]')
  const applyFilters = () => {
    const query = search?.value.trim().toLowerCase() || ''
    const selectedCategory = category?.value || 'all'
    const visible = cards.filter((card) => {
      const matchesText = `${card.dataset.productName} ${card.textContent}`.toLowerCase().includes(query)
      return matchesText && (selectedCategory === 'all' || card.dataset.category === selectedCategory)
    })
    cards.forEach((card) => { card.hidden = !visible.includes(card) })
    const sorted = [...visible].sort((a, b) => {
      const delta = Number(a.dataset.productPrice) - Number(b.dataset.productPrice)
      return sort?.value === 'price-high' ? -delta : sort?.value === 'price-low' ? delta : 0
    })
    sorted.forEach((card) => card.parentElement?.appendChild(card))
    if (results) results.textContent = `${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'} · Ready to walk`
  }
  search?.addEventListener('input', applyFilters)
  category?.addEventListener('change', applyFilters)
  sort?.addEventListener('change', applyFilters)

  const reviewForm = document.querySelector('[data-review-form]')
  reviewForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const status = reviewForm.querySelector('[data-review-status]')
    const submit = reviewForm.querySelector('button[type="submit"]')
    const formData = new FormData(reviewForm)
    submit.disabled = true
    if (status) status.textContent = 'Sending review…'
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData)) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send review.')
      if (status) status.textContent = 'Thanks. Your review is awaiting moderation.'
      reviewForm.reset()
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : 'Unable to send review.'
    } finally { submit.disabled = false }
  })

  document.querySelectorAll('.mobile-nav-toggle').forEach((toggle) => toggle.addEventListener('click', () => {
    const nav = document.querySelector('.main-nav')
    const isOpen = nav?.classList.toggle('open') || false
    toggle.setAttribute('aria-expanded', String(isOpen))
  }))
  render()
})
