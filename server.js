import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { createReadStream } from "node:fs"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const { Pool } = pg
const root = fileURLToPath(new URL(".", import.meta.url))
const port = Number(process.env.PORT || 3000)

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 5 }) : null
const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" }
const catalog = new Map([
  ["Air Force Dark", 900000], ["Jungle Utility", 949900], ["Clarks Office", 934000],
  ["Field Service", 989900], ["Air Max Green", 949900], ["Naked Wolfe", 960000],
])

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  let raw = ""
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 100_000) throw new Error("Payload too large")
  }
  return JSON.parse(raw || "{}")
}

function validateOrder(input) {
  const required = ["customerName", "customerEmail", "phone", "address"]
  if (required.some((key) => typeof input[key] !== "string" || input[key].trim().length < 2)) return "Please complete your delivery details."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail)) return "Enter a valid email address."
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 20) return "Your basket is empty or too large."
  const calculatedTotal = input.items.reduce((sum, item) => {
    if (!item || typeof item.name !== "string" || !catalog.has(item.name)) return NaN
    return sum + catalog.get(item.name)
  }, 0)
  if (!Number.isSafeInteger(calculatedTotal) || calculatedTotal !== input.totalCents) return "The order total could not be verified."
  return null
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") return sendJson(res, 200, { ok: true, database: Boolean(pool) })
    if (req.method === "GET" && req.url === "/api/catalog") return sendJson(res, 200, { products: [...catalog].map(([name, priceCents]) => ({ name, priceCents, available: true })) })
    if (req.method === "GET" && req.url?.startsWith("/api/orders/")) {
      if (!pool) return sendJson(res, 503, { error: "Order storage is not configured." })
      const orderId = req.url.split("?")[0].split("/").pop()
      if (!/^[0-9a-f-]{36}$/i.test(orderId || "")) return sendJson(res, 400, { error: "Invalid order number." })
      const result = await pool.query("SELECT id, status, created_at, customer_name, total_cents FROM orders WHERE id = $1", [orderId])
      if (!result.rows[0]) return sendJson(res, 404, { error: "Order not found." })
      return sendJson(res, 200, { order: result.rows[0] })
    }
    if (req.method === "POST" && req.url === "/api/reviews") {
      if (!pool) return sendJson(res, 503, { error: "Review storage is not configured." })
      const input = await readBody(req)
      if (typeof input.productName !== "string" || !catalog.has(input.productName) || typeof input.customerName !== "string" || typeof input.body !== "string" || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) return sendJson(res, 400, { error: "Please provide a product, name, rating, and review." })
      const result = await pool.query("INSERT INTO product_reviews (product_id, customer_name, rating, title, body, status) SELECT id, $2, $3, $4, $5, 'pending' FROM products WHERE name = $1 RETURNING id, status", [input.productName, input.customerName.trim().slice(0, 80), input.rating, String(input.title || '').slice(0, 120), input.body.trim().slice(0, 2000)])
      if (!result.rows[0]) return sendJson(res, 404, { error: "Product is not in the catalog." })
      return sendJson(res, 201, { review: result.rows[0] })
    }
    if (req.method === "GET" && req.url === "/api/admin/summary") {
      if (req.headers.authorization !== `Bearer ${process.env.ADMIN_API_KEY}` || !process.env.ADMIN_API_KEY) return sendJson(res, 401, { error: "Admin authentication required." })
      if (!pool) return sendJson(res, 503, { error: "Admin storage is not configured." })
      const [orders, reviews] = await Promise.all([pool.query("SELECT COUNT(*)::int AS count, COALESCE(SUM(total_cents), 0)::int AS revenue_cents FROM orders"), pool.query("SELECT COUNT(*)::int AS pending FROM product_reviews WHERE status = 'pending'")])
      return sendJson(res, 200, { orders: orders.rows[0], reviews: reviews.rows[0] })
    }
    if (req.method === "POST" && req.url === "/api/orders") {
      if (!pool) return sendJson(res, 503, { error: "Order storage is not configured." })
      const input = await readBody(req)
      const error = validateOrder(input)
      if (error) return sendJson(res, 400, { error })
      const result = await pool.query(
        "INSERT INTO orders (customer_name, customer_email, phone, address, items, total_cents) VALUES ($1, $2, $3, $4, $5::jsonb, $6) RETURNING id, status, created_at",
        [input.customerName.trim(), input.customerEmail.trim().toLowerCase(), input.phone.trim(), input.address.trim(), JSON.stringify(input.items), input.totalCents],
      )
      return sendJson(res, 201, { order: result.rows[0] })
    }
    if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" })
    const requestPath = decodeURIComponent((req.url || "/").split("?")[0])
    const requested = requestPath === "/" ? "/index.html" : requestPath
    const filePath = normalize(join(root, requested))
    if (!filePath.startsWith(root)) return sendJson(res, 403, { error: "Forbidden" })
    const file = await readFile(filePath)
    res.writeHead(200, { "content-type": contentTypes[extname(filePath)] || "application/octet-stream" })
    res.end(file)
  } catch (error) {
    if (req.url?.startsWith("/api/")) return sendJson(res, 500, { error: "Unable to process request." })
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    res.end("Not found")
  }
})

server.listen(port, "0.0.0.0", () => console.log(`[v0] Shoe Palace server listening on ${port}`))
process.on("SIGTERM", () => pool?.end().finally(() => server.close()))
