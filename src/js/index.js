import { DataLoader } from './dataLoader.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor() {
		super()
		this.dataLoader = new DataLoader()
	}
}
