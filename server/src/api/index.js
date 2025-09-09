import { Hono } from 'hono'
import { difficultiesRoute } from './difficulties.js'
import { playDataRoute } from './playdata.js'
import { questionsRoute } from './questions.js'
import { wsRoute } from './ws.js'

export const apiRoute = new Hono()

apiRoute.route('/difficulties/', difficultiesRoute)
apiRoute.route('/playdata/', playDataRoute)
apiRoute.route('/questions/', questionsRoute)
apiRoute.route('/ws/', wsRoute)
