import { EventRegister } from '../util/eventRegister.js'

export class GameIO extends EventRegister {
	constructor(game) {
		super()
		this.game = game
	}
}
