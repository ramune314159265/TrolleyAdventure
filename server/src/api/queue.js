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
		c.json(returnData)
	})
	.post('/update/', async (c) => {
		const body = await c.req.parseBody()
		if (!body.number) {
			c.status(400)
			c.json({
				message: 'error'
			})
		}
		queueNumber = body.number
		clients.forEach(ws => {
			ws.send(JSON.stringify({
				message: 'queue_update',
				value: queueNumber
			}))
		})
		c.json({
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
