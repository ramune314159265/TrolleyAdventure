import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'

export const app = new Hono()
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
