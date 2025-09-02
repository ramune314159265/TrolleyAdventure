import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import path from 'path'
import { apiRoute } from './api.js'
import { app, injectWebSocket } from './app.js'

app.use(logger())

app.get('/*', serveStatic({ root: path.join(import.meta.dirname, '../../game/dist') }))

app.route('/api', apiRoute)

const server = serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`)
})
injectWebSocket(server)
