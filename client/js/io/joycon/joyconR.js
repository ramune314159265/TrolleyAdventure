import { JoyConIO } from '.'
import { gameEvents, ioCommands, ioEvents } from '../../enum'

export class JoyConR {
	static selectThreshold = 0.1
	static decideButtons = ['a', 'plus', 'home', 'rightStick']
	static konamiCommand = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']
	constructor(io, joyCon) {
		this.io = io
		this.game = io.game
		this.joyCon = joyCon
		this.pastInputStatus = null
		this.averageAccelerometer = 0
		this.isBlinkingHomeLED = false
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = [0]
		this.recentInputs = []
	}
	start() {
		this.setBlinkHomeLED(true)
		this.game.on(gameEvents.nextQuestionStarted, () => {
			this.setBlinkHomeLED(false)
		})

		this.joyCon.addEventListener('hidinput', ({ detail }) => {
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
				right: 1.2 < detail.analogStickRight.horizontal || this.averageAccelerometer < -JoyConR.selectThreshold,
				left: detail.analogStickRight.horizontal < -0.8 || JoyConR.selectThreshold < this.averageAccelerometer,
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
		if (newState) {
			this.recentInputs.push(key)
			if (JoyConR.konamiCommand.length < this.recentInputs.length) {
				this.recentInputs.shift()
			}
			const isKonamiCommand = JoyConR.konamiCommand.every((k, i) => this.recentInputs[i] === k)
			if(isKonamiCommand) {
				this.game.emit(ioCommands.konamiCommand)
			}
		}
		switch (true) {
			case (JoyConR.decideButtons.includes(key) && newState):
				this.game.emit(ioEvents.decided)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.game.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
				if (this.io.state !== JoyConIO.states.questionAnswer) {
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
