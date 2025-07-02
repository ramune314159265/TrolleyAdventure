import { KeyboardIO } from './io/keyboard/index.js'
import { TrolleyIO } from './io/trolley/index.js'
import { Session } from './session.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor() {
		super()
		this.session = null
		this.ioList = [
			new TrolleyIO(this),
			new KeyboardIO(this)
		]
	}
	newSession() {
		this.session = new Session({ game: this })
		this.session.init()
	}
}
