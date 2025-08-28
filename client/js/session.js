import { Configs } from './configs'
import { DifficultManager } from './difficultManager'
import { gameEvents, ioCommands } from './enum'
import { PlayData } from './playData'
import { QuestionManager } from './questionsManager'
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
		this.lives = null
		this.questionNo = 0
		this.level = 0
		this.questionData = null
	}
	async init() {
		this.emit(gameEvents.sessionInitializing)
		await this.configs.init()
		await this.difficultManager.init()
		await this.questionsManager.init()

		this.on(ioCommands.answerQuestion, ({ isCorrect }) => this.handleAnswer({ isCorrect }))
		this.once(ioCommands.gameStart, ({ difficultId }) => this.start({ difficultId }))
		this.once(ioCommands.konamiCommand, () => {
			this.playData.setKonami(true)
			this.lives = 2 ** (32 - 1) - 1
		})

		this.emit(gameEvents.sessionLoaded, {
			difficultList: this.difficultManager.difficultConfigs
		})
	}
	start({ difficultId }) {
		this.difficultManager.setDifficult(difficultId)
		this.playData.difficult = difficultId
		this.lives ??= this.difficultManager.getDifficultConfig('lives')

		this.emit(gameEvents.gameStarted, {
			difficultData: this.difficultManager.getDifficultConfig()
		})
		this.next()
	}
	next() {
		if (this.difficultManager.getDifficultConfig('question_levels').length <= this.questionNo) {
			this.gameClear()
			return
		}
		this.level = this.difficultManager.getDifficultConfig('question_levels')[this.questionNo]
		this.questionData = this.questionsManager.pickQuestion(this.level)
		this.emit(gameEvents.nextQuestionStarted, {
			questionData: this.questionData,
			level: this.level,
			lives: this.lives,
			questionNo: this.questionNo
		})
	}
	handleAnswer({ isCorrect }) {
		this.playData.addQuestion({
			questionData: this.questionData,
			level: this.level,
			lives: this.lives,
			isCorrect,
			questionNo: this.questionNo
		})
		if (isCorrect) {
			this.questionNo++
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
		this.playData.setCleared(true)
		this.emit(gameEvents.gameCleared)
		this.once(ioCommands.gameEnd, () => this.endSession())
	}
	gameOver() {
		this.emit(gameEvents.gameOvered)
		this.once(ioCommands.gameEnd, () => this.endSession())
	}
	async endSession() {
		try {
			fetch('./api/playdata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: this.playData.getDataJson()
			})
		} catch {
			console.error('playData could not be sent')
		}
		this.emit(gameEvents.sessionEnded)
	}
}
