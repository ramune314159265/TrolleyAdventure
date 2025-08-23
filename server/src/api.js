import { zValidator } from "@hono/zod-validator"
import { readFileSync } from 'fs'
import { Hono } from 'hono'
import { JSONFilePreset } from 'lowdb/node'
import path from 'path'
import { z } from 'zod'

const db = await JSONFilePreset(path.join(import.meta.dirname, '../db.json'), {
	playData: [],
	accuracyData: {}
})

export const apiRoute = new Hono()

const questions = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/questions.json')).toString())

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

apiRoute.post('playdata', zValidator('json', playDataSchema, (result, c) => {
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
