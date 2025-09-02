import { EventRegister } from '../util/eventRegister'

export class GameIO extends EventRegister {
	constructor() {
		super()
		this.session = null
	}
}
