import { createNodeWebSocket } from '@hono/node-ws'
import { readFileSync } from 'fs'
import { Hono } from 'hono'
import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

export const app = new Hono()
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

export const db = await JSONFilePreset(path.join(import.meta.dirname, '../db.json'), {
	playData: [],
	accuracyData: {}
})

export const questions = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/questions.json')).toString())
export const difficulties = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/difficulties.json')).toString())
