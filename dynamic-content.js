document.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.querySelector('[data-featured-product]') || document.querySelector('.product')
  if (!productContainer) return

  const image = productContainer.querySelector('img')
  const title = productContainer.querySelector('[data-product-title], h3')
  const price = productContainer.querySelector('[data-product-price], p')
  if (!image || !title || !price) return

  const featuredProducts = [
    {
      image: 'images/shoe1.jpg',
      title: 'The Everyday Runner',
      price: 'KES 12,500',
      alt: 'Black leather everyday running shoe',
    },
    {
      image: 'images/shoe2.jpg',
      title: 'The City Boot',
      price: 'KES 16,800',
      alt: 'Brown leather city boot',
    },
  ]

  let currentProductIndex = 0
  let rotationTimer

  const updateFeaturedProduct = (index) => {
    const product = featuredProducts[index]
    image.src = product.image
    image.alt = product.alt
    title.textContent = product.title
    price.textContent = product.price
    currentProductIndex = index
  }

  const rotateProduct = () => {
    updateFeaturedProduct((currentProductIndex + 1) % featuredProducts.length)
  }

  const startRotation = () => {
    if (!rotationTimer) rotationTimer = window.setInterval(rotateProduct, 5000)
  }

  const stopRotation = () => {
    if (rotationTimer) {
      window.clearInterval(rotationTimer)
      rotationTimer = undefined
    }
  }

  productContainer.addEventListener('mouseenter', stopRotation)
  productContainer.addEventListener('mouseleave', startRotation)
  productContainer.addEventListener('focusin', stopRotation)
  productContainer.addEventListener('focusout', startRotation)
  updateFeaturedProduct(0)
  startRotation()
})
