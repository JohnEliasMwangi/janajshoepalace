document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form")
  if (!form) return

  const params = new URLSearchParams(window.location.search)
  const productName = params.get("productName") || "Selected pair"
  const productPrice = Number(params.get("productPrice") || 0)
  const summary = document.getElementById("order-summary")
  if (summary) summary.textContent = `${productName} · ${new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(productPrice)}`

  form.addEventListener("submit", async (event) => {
    event.preventDefault()
    const firstName = document.getElementById("first-name")?.value.trim() || ""
    const lastName = document.getElementById("last-name")?.value.trim() || ""
    const address = document.getElementById("address")?.value.trim() || ""
    const phone = document.getElementById("mobile-number")?.value.trim() || ""
    const email = document.getElementById("email")?.value.trim() || "guest@example.com"
    const message = document.getElementById("checkout-message")
    const button = form.querySelector("button[type=submit]")
    if (!firstName || !lastName || !address || !phone) {
      if (message) message.textContent = "Please complete your delivery details."
      return
    }
    button.disabled = true
    if (message) message.textContent = "Securing your order…"
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerName: `${firstName} ${lastName}`, customerEmail: email, phone, address, items: [{ name: productName, quantity: 1, unitPrice: productPrice }], totalCents: Math.round(productPrice * 100) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to save order")
      if (message) message.textContent = `Order ${result.order.id.slice(0, 8)} received. We’ll contact you to confirm delivery.`
      form.reset()
    } catch (error) {
      if (message) message.textContent = error.message
    } finally {
      button.disabled = false
    }
  })
})
