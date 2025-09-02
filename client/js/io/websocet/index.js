import { GameIO } from '..'
import { inputs, sessionStates } from '../../enum'

export class WebSocketIO extends GameIO {
	constructor() {
		super()
		this.ws = null
	}
	connectSession(session) {
		this.session = session
		session.once(sessionStates.loaded, ({ configs }) => {
			if (this.ws) {
				this.ws.close()
			}
			this.ws = new WebSocket(location.href.replace('http', 'ws') + `api/ws/${configs.get('name')}`)
			this.ws.onopen = () => {
				session.onAny((eventname, data) => {
					if (Object.keys(inputs).includes(eventname.description)) {
						return
					}
					this.ws.send(JSON.stringify({
						event: eventname.description, data
					}))
				})
			}
			this.ws.onerror = () => {
				console.error('ws connect error')
			}
		})
	}
}
