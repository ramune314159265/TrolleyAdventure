import { connectJoyCon, connectedJoyCons } from 'joy-con-webhid'
import { gameEvents, ioCommands, ioEvents } from '../../enum'
import { wait } from '../../util/wait'
import { GameIO } from '../index'

export class JoyConIO extends GameIO {
	static states = {
		difficultSelect: Symbol(),
		questionAnswer: Symbol(),
		ignore: Symbol()
	}
	static directions = {
		horizontal: Symbol(),
		right: Symbol(),
		left: Symbol()
	}
	constructor(game) {
		super(game)
		this.state = JoyConIO.states.ignore
		this.questionData = null
		this.buttonState = {
			aAndRight: false,
			bAndDown: false,
			xAndUp: false,
			yAndLeft: false
		}
		this.direction = JoyConIO.directions.horizontal
		game.once(gameEvents.sessionLoaded, data => {
			this.difficultList = data.difficultList
			this.state = JoyConIO.states.difficultSelect
		})
		game.on(gameEvents.nextQuestionStarted, data => {
			this.questionData = data.questionData
			this.state = JoyConIO.states.questionAnswer
		})
		game.on(gameEvents.gameCleared, () => {
			this.state = JoyConIO.states.ignore
		})
		game.on(gameEvents.gameOvered, () => {
			this.state = JoyConIO.states.ignore
		})

		document.addEventListener('click', async e => {
			if (!e.ctrlKey) {
				return
			}
			await connectJoyCon()
			for (const joyCon of connectedJoyCons.values()) {
				if (joyCon.eventListenerAttached) {
					continue
				}
				this.joyConHandle(joyCon)
			}
		})
	}
	async joyConHandle(joyCon) {
		joyCon.eventListenerAttached = true
		await joyCon.open()
		await joyCon.enableStandardFullMode()
		await wait(50) // 一定期間待たないとaccelerometerを取得できない
		await joyCon.enableIMUMode()
		console.log(joyCon)

		joyCon.addEventListener('hidinput', ({ detail }) => {
			switch (this.state) {
				case JoyConIO.states.difficultSelect: {
					if ((detail.buttonStatus.a || detail.buttonStatus.right) && !this.buttonState.aAndRight) {
						this.game.emit(ioCommands.gameStart, { difficultId: Object.values(this.difficultList)[0].id })
					}
					this.buttonState.aAndRight = (detail.buttonStatus.a || detail.buttonStatus.right)
					if ((detail.buttonStatus.b || detail.buttonStatus.down) && !this.buttonState.bAndDown) {
						this.game.emit(ioCommands.gameStart, { difficultId: Object.values(this.difficultList)[1].id })
					}
					this.buttonState.bAndDown = (detail.buttonStatus.b || detail.buttonStatus.down)
					if ((detail.buttonStatus.x || detail.buttonStatus.up) && !this.buttonState.xAndUp) {
						this.game.emit(ioCommands.gameStart, { difficultId: Object.values(this.difficultList)[2].id })
					}
					this.buttonState.xAndUp = (detail.buttonStatus.x || detail.buttonStatus.up)
					if ((detail.buttonStatus.y || detail.buttonStatus.left) && !this.buttonState.yAndLeft) {
						this.game.emit(ioCommands.gameStart, { difficultId: Object.values(this.difficultList)[3].id })
					}
					this.buttonState.yAndLeft = (detail.buttonStatus.y || detail.buttonStatus.left)
					break
				}
				case JoyConIO.states.questionAnswer: {
					if (0.2 < detail.accelerometers[0]?.y?.acc) { // 左
						if ((detail.buttonStatus.a || detail.buttonStatus.right) && !this.buttonState.aAndRight) {
							this.game.emit(ioCommands.answerQuestion, { isCorrect: this.questionData.options[0].isCorrect, index: 0 })
						}
						if (this.direction !== JoyConIO.directions.left) {
							this.game.emit(ioEvents.leftSelected)
							this.direction = JoyConIO.directions.left
						}
					}
					if (detail.accelerometers[0]?.y?.acc < -0.2) { // 右
						if ((detail.buttonStatus.a || detail.buttonStatus.right) && !this.buttonState.aAndRight) {
							this.game.emit(ioCommands.answerQuestion, { isCorrect: this.questionData.options[1].isCorrect, index: 1 })
						}
						if (this.direction !== JoyConIO.directions.right) {
							this.game.emit(ioEvents.rightSelected)
							this.direction = JoyConIO.directions.right
						}
					}
					this.buttonState.aAndRight = (detail.buttonStatus.a || detail.buttonStatus.right)
					if (-0.2 <= detail.accelerometers[0]?.y?.acc && detail.accelerometers[0]?.y?.acc <= 0.2) {
						if (this.direction === JoyConIO.directions.horizontal) {
							return
						}
						this.game.emit(ioEvents.deselected)
						this.direction = JoyConIO.directions.horizontal
					}
					break
				}
			}
		})
	}
}
