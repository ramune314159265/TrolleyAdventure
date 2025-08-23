import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import path from 'path'
import { apiRoute } from './api.js'

const app = new Hono()
app.use(logger())

app.get('/*', serveStatic({ root: path.join(import.meta.dirname, '../../dist') }))

app.route('/api', apiRoute)

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`)
})
