import { Hono } from 'hono'
import { upgradeWebSocket } from '../app.js'

export const queueRoute = new Hono()

let queueNumber = 0
const clients = new Set()

queueRoute
	.get('/', (c) => {
		const returnData = {
			queue: queueNumber
		}
		return c.json(returnData)
	})
	.post('/update/', async (c) => {
		const body = await c.req.json()
		if (!Object.hasOwn(body, 'number')) {
			c.status(400)
			return c.json({
				message: 'error'
			})
		}
		queueNumber = body.number
		for (const client of clients) {
			client.send(JSON.stringify({
				message: 'queue_update',
				queue: queueNumber
			}))
		}
		return c.json({
			message: 'updated'
		})
	})

queueRoute
	.get('/ws/', upgradeWebSocket(() => {
		return {
			onOpen: (event, ws) => {
				console.log(`ws queue connected`)
				clients.add(ws)
			},
			onClose: (event, ws) => {
				clients.delete(ws)
			},
			onError: (ws, err) => {
				console.error(`ws queue error:`, err)
			}
		}
	}))
