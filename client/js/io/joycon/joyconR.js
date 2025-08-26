import { JoyConIO } from '.'
import { gameEvents, ioCommands, ioEvents } from '../../enum'
import { quaternionToEuler } from '../../util/quaternion'

export class JoyConR {
	static selectThreshold = Math.PI * (170 / 180)
	static decideButtons = ['a', 'plus', 'home', 'rightStick']
	static konamiCommand = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']
	constructor(io, joyCon) {
		this.io = io
		this.session = io.session
		this.joyCon = joyCon
		this.pastInputStatus = null
		this.isBlinkingHomeLED = false
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = [0]
		this.recentInputs = []
	}
	start() {
		this.setBlinkHomeLED(true)
		this.session.on(gameEvents.nextQuestionStarted, () => {
			this.setBlinkHomeLED(false)
		})

		this.joyCon.addEventListener('hidinput', ({ detail }) => {
			const { roll } = quaternionToEuler(this.joyCon.madgwick.getQuaternion())
			if (!this.pastInputStatus) {
				this.pastInputStatus = detail.buttonStatus
				return
			}
			const inputStatus = {
				...detail.buttonStatus,
				up: detail.analogStickRight.vertical < -0.6,
				down: 1 < detail.analogStickRight.vertical,
				right: 1.2 < detail.analogStickRight.horizontal || (-JoyConR.selectThreshold < roll && roll < -Math.PI / 2),
				left: detail.analogStickRight.horizontal < -0.8 || (Math.PI / 2 < roll && roll < JoyConR.selectThreshold),
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
			if (isKonamiCommand) {
				this.session.emit(ioCommands.konamiCommand)
			}
		}
		switch (true) {
			case (JoyConR.decideButtons.includes(key) && newState):
				this.session.emit(ioEvents.decided)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.session.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
				if (this.io.state !== JoyConIO.states.questionAnswer) {
					break
				}
				this.setBlinkHomeLED(false)
				break

			case key === 'right':
				this.session.emit(ioEvents.rightSelected)
				this.direction = JoyConIO.directions.right
				this.setBlinkHomeLED(this.joyCon, true)
				break

			case key === 'left':
				this.session.emit(ioEvents.leftSelected)
				this.direction = JoyConIO.directions.left
				this.setBlinkHomeLED(this.joyCon, true)
				break

			default:
				break
		}
	}
}
