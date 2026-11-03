document.addEventListener("DOMContentLoaded", () => {
  const featuredProducts = [
    { image: "images/shoe1.jpg", title: "High-Quality Sneaker", price: "$99.99" },
    { image: "images/shoe2.jpg", title: "Comfortable Boots", price: "$129.99" },
  ]

  let currentProductIndex = 0
  let cartCount = 0

  const productContainer = document.querySelector(".product")
  const cartCountElement = document.querySelector("#cart-count")

  const renderFeaturedProduct = () => {
    if (!productContainer) return

    const product = featuredProducts[currentProductIndex]
    const image = productContainer.querySelector("img")
    const title = productContainer.querySelector("h3")
    const price = productContainer.querySelector("p")

    if (image) {
      image.src = product.image
      image.alt = product.title
    }
    if (title) title.textContent = product.title
    if (price) price.textContent = product.price

    currentProductIndex = (currentProductIndex + 1) % featuredProducts.length
  }

  if (productContainer && featuredProducts.length > 1) {
    window.setInterval(renderFeaturedProduct, 5000)
  }

  const updateCartCount = () => {
    if (cartCountElement) cartCountElement.textContent = String(cartCount)
  }

  document.querySelectorAll(".product-card .add-button, .product .add-button, [data-add-to-cart]").forEach((button) => {
    const defaultLabel = button.dataset.label || button.textContent.trim().replace(/\s*\+\s*$/, "") || "Add to bag"
    button.dataset.label = defaultLabel
    button.addEventListener("click", () => {
      cartCount += 1
      updateCartCount()
      button.textContent = "Added to bag"
      button.setAttribute("aria-label", `${defaultLabel}; item added`)
      window.setTimeout(() => {
        button.textContent = `${defaultLabel} +`
        button.setAttribute("aria-label", defaultLabel)
      }, 1200)
    })
  })

  const paymentMethod = document.querySelector("#payment-method")
  const cardPayment = document.querySelector("#card-payment")
  const mpesaPayment = document.querySelector("#mpesa-payment")

  const updatePaymentFields = () => {
    const isMpesa = paymentMethod?.value === "mpesa"
    if (cardPayment) cardPayment.hidden = Boolean(isMpesa)
    if (mpesaPayment) mpesaPayment.hidden = !isMpesa
  }

  paymentMethod?.addEventListener("change", updatePaymentFields)
  updatePaymentFields()

  const mpesaButton = document.querySelector("#mpesa-button")
  const phoneInput = document.querySelector("#phone-number")
  const amountInput = document.querySelector("#amount")
  const paymentStatus = document.querySelector("[data-payment-status]")

  mpesaButton?.addEventListener("click", async () => {
    const phoneNumber = phoneInput?.value.trim()
    const amount = Number(amountInput?.value)

    if (!phoneNumber || !Number.isFinite(amount) || amount <= 0) {
      if (paymentStatus) paymentStatus.textContent = "Enter a valid phone number and amount."
      return
    }

    mpesaButton.disabled = true
    if (paymentStatus) paymentStatus.textContent = "Starting payment…"

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, amount, paymentMethod: "mpesa" }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Payment could not be started.")
      if (paymentStatus) paymentStatus.textContent = "Order received. We will confirm payment shortly."
    } catch (error) {
      if (paymentStatus) paymentStatus.textContent = error instanceof Error ? error.message : "Payment could not be started."
    } finally {
      mpesaButton.disabled = false
    }
  })
})
