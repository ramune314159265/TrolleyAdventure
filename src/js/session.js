import { Configs } from './configs'
import { DataLoader } from './dataLoader'
import { DifficultManager } from './difficultManager'
import { QuestionManager } from './questionsManager'
import { EventRegister } from './util/eventRegister'

export class Session extends EventRegister {
	constructor({ game }) {
		super()
		this.game = game
		this.dataLoader = new DataLoader()
		this.configs = new Configs()
		this.difficultManager = new DifficultManager({ dataLoader: this.dataLoader })
		this.questionsManager = new QuestionManager({ dataLoader: this.dataLoader, configs: this.configs })
		this
	}
	async init() {
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()
	}
}
