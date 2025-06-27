import { gameEvents, ioCommands } from '../../enum.js'
import { GameIO } from '../index.js'

export class TestHtmlIO extends GameIO {
	constructor(game) {
		super(game)
		this.main = document.createElement('div')
		document.body.append(this.main)
		game.onAny(console.log)
		game.once(gameEvents.sessionInitializing, () => this.gameLoading())
	}
	gameLoading() {
		this.main.innerText = '読み込み中'
		this.game.once(gameEvents.sessionLoaded, data => this.gameStartScene(data))
	}
	gameStartScene(data) {
		this.main.innerHTML = ''
		const div = document.createElement('div')
		div.innerText = '難易度選択'
		this.main.append(div)
		Object.values(data.difficultList).forEach(d => {
			const button = document.createElement('button')
			button.innerText = d.name
			button.onclick = () => this.game.emit(ioCommands.gameStart, { difficultId: d.id })
			this.main.append(button)
		})
		this.game.on(gameEvents.nextQuestionStarted, data => this.questionScene(data))
		this.game.on(gameEvents.gameOvered, () => this.gameOveredScene())
	}
	questionScene(data) {
		this.main.innerHTML = ''
		const div = document.createElement('div')
		div.innerText = data.questionData.content
		this.main.append(div)
		const correctButton = document.createElement('button')
		correctButton.innerText = data.questionData.answer.content
		correctButton.onclick = () => this.game.emit(ioCommands.answerQuestion, { isCorrect: true })
		this.main.append(correctButton)
		const incorrectButton = document.createElement('button')
		incorrectButton.onclick = () => this.game.emit(ioCommands.answerQuestion, { isCorrect: false })
		incorrectButton.innerText = data.questionData.option.content
		this.main.append(incorrectButton)
	}
	gameOveredScene() {
		this.main.innerHTML = 'Game Over'
	}
}
