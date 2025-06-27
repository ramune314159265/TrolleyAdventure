import { Configs } from './configs.js'
import { DifficultManager } from './difficultManager.js'
import { gameEvents, ioCommands } from './enum.js'
import { QuestionManager } from './questionsManager.js'
import { DataLoader } from './util/dataLoader.js'
import { EventRegister } from './util/eventRegister.js'

export class Session extends EventRegister {
	constructor({ game }) {
		super()
		this.game = game
		this.dataLoader = new DataLoader()
		this.configs = new Configs({ dataLoader: this.dataLoader })
		this.difficultManager = new DifficultManager({ dataLoader: this.dataLoader })
		this.questionsManager = new QuestionManager({ dataLoader: this.dataLoader, configs: this.configs })
		this.lives = 1
		this.currentQuestionNo = 0
		this.currentQuestionData = null
	}
	async init() {
		this.game.emit(gameEvents.sessionInitializing)
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()

		this.game.on(ioCommands.answerQuestion, ({ isCorrect }) => this.handleAnswer({ isCorrect }))
		this.game.once(ioCommands.gameStart, ({ difficultId }) => this.start({ difficultId }))

		this.game.emit(gameEvents.sessionLoaded, {
			difficultList: this.difficultManager.difficultConfigs
		})
	}
	start({ difficultId }) {
		this.difficultManager.setDifficult(difficultId)
		this.lives = this.difficultManager.getDifficultConfig('lives')

		this.game.emit(gameEvents.gameStarted, {
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
		this.game.emit(gameEvents.nextQuestionStarted, {
			questionData,
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
		this.game.emit(gameEvents.gameCleared)
	}
	gameOver() {
		this.game.emit(gameEvents.gameOvered)
	}
}
