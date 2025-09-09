import { Hono } from 'hono'
import { db, questions } from '../app.js'

export const questionsRoute = new Hono()

questionsRoute.get('/', async (c) => {
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
