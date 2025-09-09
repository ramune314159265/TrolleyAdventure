import { Configs } from './configs'
import { DifficultManager } from './difficultManager'
import { sessionStates } from './enum'
import { PlayData } from './playData'
import { QuestionManager } from './questionsManager'
import { LoadedState } from './states/loaded'
import { DataLoader } from './util/dataLoader'
import { EventRegister } from './util/eventRegister'

export class Session extends EventRegister {
	constructor() {
		super()
		this.dataLoader = new DataLoader()
		this.configs = new Configs({ dataLoader: this.dataLoader })
		this.difficultManager = new DifficultManager({ dataLoader: this.dataLoader })
		this.questionsManager = new QuestionManager({ dataLoader: this.dataLoader })
		this.playData = new PlayData()
		this.questionData = null
		this.lives = null
		this.questionNo = -1
		this.level = 0
		this.state = null
	}
	async init() {
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()
		this.enterState(new LoadedState({ session: this }))
	}
	start({ difficultId }) {
		this.difficultManager.setDifficult(difficultId)
		this.playData.difficult = difficultId
		this.lives ??= this.difficultManager.getDifficultConfig('lives')
	}
	nextQuestion() {
		this.questionNo++
		this.level = this.difficultManager.getDifficultConfig('question_levels')[this.questionNo]
		this.questionData = this.questionsManager.pickQuestion(this.level)
	}
	enterState(state) {
		this.state?.exit?.()
		this.state = state
		state.enter()
	}
	async end() {
		try {
			fetch('/api/playdata/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: this.playData.getDataJson()
			})
		} catch {
			console.error('playData could not be sent')
		}
		this.state = null
		this.emit(sessionStates.ended)
	}
}
