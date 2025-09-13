import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import path from 'path'
import { apiRoute } from './api/index.js'
import { app, injectWebSocket } from './app.js'

app.use(logger())

app.get('/game/*', serveStatic({
	root: path.join(import.meta.dirname, '../../'),
	rewriteRequestPath: (path) => path.replace(/^\/game/, '/game/dist/')
}))
app.get('/gyro/*', serveStatic({
	root: path.join(import.meta.dirname, '../../'),
	rewriteRequestPath: (path) => path.replace(/^\/gyro/, '/gyro/dist/')
}))
app.get('/ssh/queue/*', serveStatic({
	root: path.join(import.meta.dirname, '../../'),
	rewriteRequestPath: (path) => path.replace(/^\/ssh\/queue/, '/queue/dist/')
}))
app.get('/reception/*', serveStatic({
	root: path.join(import.meta.dirname, '../../'),
	rewriteRequestPath: (path) => path.replace(/^\/reception/, '/reception/dist/')
}))
app.get('/adm/*', serveStatic({
	root: path.join(import.meta.dirname, '../../'),
	rewriteRequestPath: (path) => path.replace(/^\/adm/, '/adm/dist/')
}))
app.get('/sink/', serveStatic({
	path: path.join(import.meta.dirname, '../../sink/index.html')
}))

app.route('/api/', apiRoute)

const server = serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`)
})
injectWebSocket(server)
