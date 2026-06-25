import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import authorRoutes from './routes/author.ts'
import authRoutes from './routes/auth.ts'
import apiKeyRoutes from './routes/apiKey.ts'
import { env } from './data/env.ts'

const app = new Hono();

app.use('*', trimTrailingSlash())

app.route("/authors", authorRoutes)
app.route("/auth", authRoutes)
app.route("/api-keys", apiKeyRoutes)

serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
