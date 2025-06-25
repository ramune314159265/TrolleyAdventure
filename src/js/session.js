import { Configs } from './configs.js'
import { DataLoader } from './dataLoader.js'
import { DifficultManager } from './difficultManager.js'
import { gameEvents } from './emun.js'
import { QuestionManager } from './questionsManager.js'
import { EventRegister } from './util/eventRegister.js'

export class Session extends EventRegister {
	constructor({ game }) {
		super()
		this.game = game
		this.dataLoader = new DataLoader()
		this.configs = new Configs({ dataLoader: this.dataLoader })
		this.difficultManager = new DifficultManager({ dataLoader: this.dataLoader })
		this.questionsManager = new QuestionManager({ dataLoader: this.dataLoader, configs: this.configs })
		this
	}
	async init() {
		this.game.emit(gameEvents.sessionInitializing)
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()
		this.game.emit(gameEvents.sessionLoaded)
	}
}
