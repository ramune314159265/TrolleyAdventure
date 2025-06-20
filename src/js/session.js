import { EventRegister } from './util/eventRegister'

export class Session extends EventRegister {
	constructor({game}){
		super()
		this.game = game
	}
}
