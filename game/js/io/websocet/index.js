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
			const url = new URL(location.href)
			this.ws = new WebSocket(`${url.protocol === 'http:' ? 'ws' : 'wss'}://${url.host}/api/ws/${configs.get('name')}`)
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
			this.ws.onmessage = message => {
				const data = JSON.parse(message.data)
				const eventname = inputs[data.event]
				if (eventname) {
					return
				}
				session.emit(eventname, data.data)
			}
			this.ws.onerror = () => {
				console.error('ws connect error')
			}
		})
	}
}
