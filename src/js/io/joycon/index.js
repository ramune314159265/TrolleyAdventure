import { connectJoyCon, connectedJoyCons } from 'joy-con-webhid'
import { gameEvents, ioEvents } from '../../enum'
import { wait } from '../../util/wait'
import { GameIO } from '../index'

export class JoyConIO extends GameIO {
	static selectThreshold = 0.1
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
		this.buttonPressed = false
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = []
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

		const start = () => {
			for (const joyCon of connectedJoyCons.values()) {
				if (joyCon.eventListenerAttached) {
					continue
				}
				this.joyConHandle(joyCon)
			}
		}
		document.addEventListener('click', async e => {
			if (!e.ctrlKey) {
				return
			}
			await connectJoyCon()
			start()
		})
		start()
	}
	async joyConHandle(joyCon) {
		joyCon.eventListenerAttached = true
		await joyCon.open()
		await joyCon.enableStandardFullMode()
		await wait(100) // 一定期間待たないとaccelerometerを取得できない
		await joyCon.setLED(0)
		await joyCon.enableIMUMode()
		console.log(joyCon)

		joyCon.addEventListener('hidinput', ({ detail }) => {
			if (detail.accelerometers) {
				this.recentAccelerometers.push(detail.accelerometers[0].y.acc)
				if (10 < this.recentAccelerometers.length) {
					this.recentAccelerometers.shift()
				}
			}
			const averageAccelerometer = this.recentAccelerometers.reduce((a, b) => a + b) / this.recentAccelerometers.length
			if (JoyConIO.selectThreshold < averageAccelerometer || detail.analogStickRight.horizontal < -0.8) { // 左
				if (this.direction !== JoyConIO.directions.left) {
					this.game.emit(ioEvents.leftSelected)
					this.direction = JoyConIO.directions.left
				}
			}
			if (averageAccelerometer < -JoyConIO.selectThreshold || 1.2 < detail.analogStickRight.horizontal) { // 右
				if (this.direction !== JoyConIO.directions.right) {
					this.game.emit(ioEvents.rightSelected)
					this.direction = JoyConIO.directions.right
				}
			}
			if (this.isButtonPressed(detail) && !this.buttonPressed) {
				this.game.emit(ioEvents.decided)
			}
			this.buttonPressed = this.isButtonPressed(detail)
			if (
				(-JoyConIO.selectThreshold <= averageAccelerometer && averageAccelerometer <= JoyConIO.selectThreshold) &&
				(-0.8 <= detail.analogStickRight.horizontal && detail.analogStickRight.horizontal <= 1.2)
			) {
				if (this.direction === JoyConIO.directions.horizontal) {
					return
				}
				this.game.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
			}
		})
	}
	isButtonPressed(detail) {
		return Object.values(detail.buttonStatus).some(s => (typeof s) === 'boolean' && s)
	}
}
