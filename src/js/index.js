import { Session } from './session.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor() {
		super()
		this.session = null
	}
	newSession() {
		this.session = new Session(this)
		this.session.init()
	}
}
