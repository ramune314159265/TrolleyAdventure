import { JoyConIO } from './io/joycon/index'
import { KeyboardIO } from './io/keyboard/index'
import { TrolleyIO } from './io/trolley/index'
import { Session } from './session'
import { EventRegister } from './util/eventRegister'

export class Game extends EventRegister {
	constructor() {
		super()
		this.session = null
		this.ioList = [
			new TrolleyIO(this),
			new KeyboardIO(this),
			new JoyConIO(this)
		]
	}
	newSession() {
		this.session = new Session({ game: this })
		this.session.init()
	}
}
