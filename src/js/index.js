import { TestHtmlIO } from './io/testhtml/index.js'
import { Session } from './session.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor() {
		super()
		this.session = null
		this.io = new TestHtmlIO(this)
	}
	newSession() {
		this.session = new Session({ game: this })
		this.session.init()
	}
}
