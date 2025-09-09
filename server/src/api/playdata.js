import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../app.js'

export const playDataRoute = new Hono()

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

playDataRoute
	.get('/', (c) => {
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
