import { zValidator } from '@hono/zod-validator'
import { readFileSync } from 'fs'
import { Hono } from 'hono'
import { JSONFilePreset } from 'lowdb/node'
import path from 'path'
import { z } from 'zod'
import { upgradeWebSocket } from './app.js'

const db = await JSONFilePreset(path.join(import.meta.dirname, '../db.json'), {
	playData: [],
	accuracyData: {}
})

export const apiRoute = new Hono()

const questions = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/questions.json')).toString())
const difficulties = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/difficulties.json')).toString())

apiRoute.get('questions', async (c) => {
	const accuracyData = db.data.accuracyData
	const returnData = questions.map(question => {
		return {
			...question,
			options: question.options.map((option, index) => {
				if (!accuracyData[question.id]?.[index]) {
					return {
						...option,
						accuracy: 1
					}
				}
				const data = accuracyData[question.id]?.[index]
				const accuracy = data.filter(b => b).length / data.length
				return {
					...option,
					accuracy
				}
			})
		}
	})
	return c.json(returnData)
})

apiRoute.get('difficulties', async (c) => {
	const playData = db.data.playData
	const returnData = difficulties.map(difficult => {
		const difficultPlayData = playData.filter(p => p.difficult === difficult.id)
		if (difficultPlayData.length === 0) {
			return {
				...difficult,
				pass_rate: 0
			}
		}
		const passRate = difficultPlayData.filter(p => p.cleared).length / difficultPlayData.length
		return {
			...difficult,
			pass_rate: passRate
		}
	})
	return c.json(returnData)
})

const questionDataSchema = z.object({
	level: z.number(),
	lives: z.number(),
	correct: z.boolean(),
	questionNo: z.number(),
	questionId: z.string(),
	optionIndex: z.number()
})

const playDataSchema = z.object({
	difficult: z.string(),
	questions: z.array(questionDataSchema),
	konami: z.boolean(),
	cleared: z.boolean()
})

apiRoute
	.get('playdata', (c) => {
		return c.json(db.data.playData)
	})
	.post(zValidator('json', playDataSchema, (result, c) => {
		if (!result.success) {
			return c.json({ error: 'Bad request' }, 400)
		}
	}), (c) => {
		db.update(({ playData, accuracyData }) => {
			const data = c.req.valid('json')
			playData.push(data)
			const questionDataList = data.questions
			questionDataList.forEach(questionData => {
				accuracyData[questionData.questionId] ??= {}
				accuracyData[questionData.questionId][questionData.optionIndex] ??= []
				accuracyData[questionData.questionId][questionData.optionIndex].push(questionData.correct)
			})
		})
		return c.json({ message: 'ok' })
	})

const channels = new Map()

apiRoute
	.get('/ws/:channel', upgradeWebSocket((c) => {
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
