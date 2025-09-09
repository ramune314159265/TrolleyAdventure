import { inputs, outputs } from '../../enum'
import { quaternionToEuler } from '../../util/quaternion'

export class JoyConR {
	static selectThreshold = Math.PI * (175 / 180)
	static decideButtons = ['a', 'plus', 'home', 'rightStick']
	static konamiCommand = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']
	constructor(io, joyCon) {
		this.io = io
		this.session = io.session
		this.joyCon = joyCon
		this.pastInputStatus = null
		this.isBlinkingHomeLED = false
		this.recentInputs = []
		this.stickOffsets = null
	}
	start() {
		this.joyCon.addEventListener('hidinput', ({ detail }) => {
			const { roll } = quaternionToEuler(this.joyCon.madgwick.getQuaternion())
			if (!this.stickOffsets) {
				this.stickOffsets = {
					horizontal: -parseFloat(detail.analogStickRight.horizontal),
					vertical: -parseFloat(detail.analogStickRight.vertical)
				}
			}
			if (!this.pastInputStatus) {
				this.pastInputStatus = detail.buttonStatus
				return
			}
			const inputStatus = {
				...detail.buttonStatus,
				up: (parseFloat(detail.analogStickRight.vertical) + this.stickOffsets.vertical) < -0.8,
				down: 0.8 < (parseFloat(detail.analogStickRight.vertical) + this.stickOffsets.vertical),
				right: 1 < (parseFloat(detail.analogStickRight.horizontal) + this.stickOffsets.horizontal) || (-JoyConR.selectThreshold < roll && roll < -Math.PI / 2),
				left: (parseFloat(detail.analogStickRight.horizontal) + this.stickOffsets.horizontal) < -1 || (Math.PI / 2 < roll && roll < JoyConR.selectThreshold),
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
		this.session.on(outputs.changeAvailableControls, ({ controls }) => {
			if (Object.hasOwn(controls, 'a')) {
				this.setBlinkHomeLED(true)
				return
			}
			this.setBlinkHomeLED(false)
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
				this.session.emit(inputs.konami)
			}
		}
		switch (true) {
			case (JoyConR.decideButtons.includes(key) && newState):
				this.session.emit(inputs.confirm)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.session.emit(inputs.center)
				break

			case key === 'right':
				this.session.emit(inputs.right)
				break

			case key === 'left':
				this.session.emit(inputs.left)
				break

			default:
				break
		}
	}
}
