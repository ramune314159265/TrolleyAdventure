import { EventRegister } from '../util/eventRegister'

export class GameIO extends EventRegister {
	static instance
	constructor(game) {
		super()
		this.game = game
		GameIO.instance = this
	}
}
