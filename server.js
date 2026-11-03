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
  if (!Array.isArray(input.items) || input.items.length === 0) return "Your basket is empty."
  if (!Number.isInteger(input.totalCents) || input.totalCents < 1) return "The order total is invalid."
  return null
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") return sendJson(res, 200, { ok: true, database: Boolean(pool) })
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
