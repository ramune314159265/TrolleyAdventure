import { GameIO } from './io/index.js'
import { Session } from './session.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor() {
		super()
		this.session = null
		this.io = new GameIO(this)
	}
	newSession() {
		this.session = new Session({ game: this })
		this.session.init()
	}
}
