import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import authorRoutes from './routes/author.ts'

const app = new Hono();

app.use('*', trimTrailingSlash())

app.route("/authors", authorRoutes)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
