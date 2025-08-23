import { gameEvents, ioCommands } from '../../enum'
import { GameIO } from '../index'

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
		this.session.once(gameEvents.sessionLoaded, data => this.gameStartScene(data))
	}
	gameStartScene(data) {
		this.main.innerHTML = ''
		const div = document.createElement('div')
		div.innerText = '難易度選択'
		this.main.append(div)
		Object.values(data.difficultList).forEach(d => {
			const button = document.createElement('button')
			button.innerText = d.name
			button.onclick = () => this.session.emit(ioCommands.gameStart, { difficultId: d.id })
			this.main.append(button)
		})
		this.session.on(gameEvents.nextQuestionStarted, data => this.questionScene(data))
		this.session.on(gameEvents.gameOvered, () => this.gameOveredScene())
		this.session.on(gameEvents.gameCleared, () => this.gameClearedScene())
	}
	questionScene(data) {
		this.main.innerHTML = ''
		const div = document.createElement('div')
		div.innerText = data.questionData.content
		this.main.append(div)
		data.questionData.options.forEach((o, i) => {
			const button = document.createElement('button')
			button.innerText = o.content
			button.onclick = () => this.session.emit(ioCommands.answerQuestion, { isCorrect: o.isCorrect, index: i - 1 })
			this.main.append(button)
		})
	}
	gameClearedScene() {
		this.main.innerHTML = 'Game Clear'
	}
	gameOveredScene() {
		this.main.innerHTML = 'Game Over'
	}
}
