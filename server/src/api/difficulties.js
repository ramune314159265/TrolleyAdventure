import { Hono } from 'hono'
import { db, difficulties } from '../app.js'

export const difficultiesRoute = new Hono()

difficultiesRoute.get('/', async (c) => {
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
