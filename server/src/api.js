import { readFileSync } from 'fs'
import { Hono } from 'hono'
import path from 'path'

export const apiRoute = new Hono()

const questions = JSON.parse(readFileSync(path.join(import.meta.dirname, '../data/questions.json')).toString())

apiRoute.get('questions', (c) => {
	const returnData = questions.map(question => {
		return {
			...question,
			options: question.options.map(option => {
				return {
					...option,
					accuracy: 1
				}
			})
		}
	})
	return c.json(returnData)
})
