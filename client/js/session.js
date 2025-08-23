import { Configs } from './configs'
import { DifficultManager } from './difficultManager'
import { gameEvents, ioCommands } from './enum'
import { QuestionManager } from './questionsManager'
import { DataLoader } from './util/dataLoader'
import { EventRegister } from './util/eventRegister'

export class Session extends EventRegister {
	constructor() {
		super()
		this.dataLoader = new DataLoader()
		this.configs = new Configs({ dataLoader: this.dataLoader })
		this.difficultManager = new DifficultManager({ dataLoader: this.dataLoader })
		this.questionsManager = new QuestionManager({ dataLoader: this.dataLoader, configs: this.configs })
		this.lives = null
		this.currentQuestionNo = 0
		this.currentQuestionData = null
	}
	async init() {
		this.emit(gameEvents.sessionInitializing)
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()

		this.on(ioCommands.answerQuestion, ({ isCorrect }) => this.handleAnswer({ isCorrect }))
		this.once(ioCommands.gameStart, ({ difficultId }) => this.start({ difficultId }))
		this.once(ioCommands.konamiCommand, () => {
			this.lives = 2 ** (32 - 1) - 1
		})

		this.emit(gameEvents.sessionLoaded, {
			difficultList: this.difficultManager.difficultConfigs
		})
	}
	start({ difficultId }) {
		this.difficultManager.setDifficult(difficultId)
		this.lives ??= this.difficultManager.getDifficultConfig('lives')

		this.emit(gameEvents.gameStarted, {
			difficultData: this.difficultManager.getDifficultConfig()
		})
		this.next()
	}
	next() {
		if (this.difficultManager.getDifficultConfig('question_levels').length <= this.currentQuestionNo) {
			this.gameClear()
			return
		}
		const questionLevel = this.difficultManager.getDifficultConfig('question_levels')[this.currentQuestionNo]
		const questionData = this.questionsManager.pickQuestion(questionLevel)
		this.currentQuestionData = questionData
		this.emit(gameEvents.nextQuestionStarted, {
			questionData,
			level: questionLevel,
			lives: this.lives,
			questionNo: this.currentQuestionNo
		})
	}
	handleAnswer({ isCorrect }) {
		if (isCorrect) {
			this.currentQuestionNo++
			this.next()
			return
		}
		this.lives--
		if (0 < this.lives) {
			this.next()
			return
		}
		this.gameOver()
	}
	gameClear() {
		this.emit(gameEvents.gameCleared)
		this.once(ioCommands.gameEnd, () => this.endSession())
	}
	gameOver() {
		this.emit(gameEvents.gameOvered)
		this.once(ioCommands.gameEnd, () => this.endSession())
	}
	async endSession() {
		this.emit(gameEvents.sessionEnded)
	}
}
