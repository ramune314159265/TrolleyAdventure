import { connectJoyCon, connectedJoyCons } from 'joy-con-webhid'
import { gameEvents, ioEvents } from '../../enum'
import { wait } from '../../util/wait'
import { GameIO } from '../index'

export class JoyConIO extends GameIO {
	static selectThreshold = 0.1
	static decideButtons = ['a', 'plus', 'home', 'rightStick']
	static konamiCommand = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']
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
		this.pastInputStatus = null
		this.averageAccelerometer = 0
		this.isBlinkingHomeLED = false
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = [0]
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
		await wait(100)
		console.log(joyCon)
		this.joyCon = joyCon

		this.setBlinkHomeLED(true)

		this.game.on(gameEvents.nextQuestionStarted, () => {
			this.setBlinkHomeLED(false)
		})

		joyCon.addEventListener('hidinput', ({ detail }) => {
			if (detail.accelerometers) {
				this.recentAccelerometers.push(detail.accelerometers[0].y.acc)
				if (10 < this.recentAccelerometers.length) {
					this.recentAccelerometers.shift()
				}
			}
			this.averageAccelerometer = this.recentAccelerometers.reduce((a, b) => a + b) / this.recentAccelerometers.length
			if (!this.pastInputStatus) {
				this.pastInputStatus = detail.buttonStatus
				return
			}
			const inputStatus = {
				...detail.buttonStatus,
				up: detail.analogStickRight.vertical < -0.6,
				down: 1 < detail.analogStickRight.vertical,
				right: 1.2 < detail.analogStickRight.horizontal || this.averageAccelerometer < -JoyConIO.selectThreshold,
				left: detail.analogStickRight.horizontal < -0.8 || JoyConIO.selectThreshold < this.averageAccelerometer,
			}
			Object.entries(inputStatus).forEach(([k, v]) => {
				if (typeof v !== 'boolean') {
					return
				}
				if (this.pastInputStatus[k] !== v) {
					this.inputChange(k, v)
				}
			})
			this.pastInputStatus = inputStatus
		})
	}
	setBlinkHomeLED(state) {
		if (this.isBlinkingHomeLED === state) {
			return
		}
		this.isBlinkingHomeLED = state
		if (state) {
			this.joyCon.setHomeLEDPattern(5, 0, 15, [
				{ intensity: 0, fadeDuration: 10, duration: 0 },
				{ intensity: 15, fadeDuration: 10, duration: 0 }
			])
		} else {
			this.joyCon.setHomeLED(false)
		}
	}
	inputChange(key, newState) {
		switch (true) {
			case (JoyConIO.decideButtons.includes(key) && newState):
				this.game.emit(ioEvents.decided)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.game.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
				if (this.state !== JoyConIO.states.questionAnswer) {
					break
				}
				this.setBlinkHomeLED(false)
				break

			case key === 'right':
				this.game.emit(ioEvents.rightSelected)
				this.direction = JoyConIO.directions.right
				this.setBlinkHomeLED(this.joyCon, true)
				break

			case key === 'left':
				this.game.emit(ioEvents.leftSelected)
				this.direction = JoyConIO.directions.left
				this.setBlinkHomeLED(this.joyCon, true)
				break

			default:
				break
		}
	}
}
