import { Hono } from 'hono'
import { upgradeWebSocket } from '../app.js'

export const wsRoute = new Hono()

const channels = new Map()

wsRoute
	.get('/', (c) => {
		const returnData = [...channels.entries()].map(([id, clients]) => {
			return {
				id, count: clients.size
			}
		})
		return c.json(returnData)
	})

wsRoute
	.get('/:channel', upgradeWebSocket((c) => {
		const { channel } = c.req.param()

		return {
			onOpen: (event, ws) => {
				if (!channels.has(channel)) {
					channels.set(channel, new Set())
				}
				channels.get(channel).add(ws)
				console.log(`ws connected ${channel}`)
			},
			onMessage: (event, ws) => {
				const data = event.data
				const clients = channels.get(channel) || new Set()
				console.log(`ws message ${channel}: ${data}`)
				for (const client of clients) {
					if (client !== ws && client.readyState === 1) {
						client.send(data)
					}
				}
			},
			onClose: (ws) => {
				const clients = channels.get(channel)
				if (clients) {
					clients.delete(ws)
					if (clients.size === 0) {
						channels.delete(channel)
					}
				}
				console.log(`ws disconnected ${channel}`)
			},
			onError: (ws, err) => {
				console.error(`ws error ${channel}:`, err)
			}
		}
	}))
