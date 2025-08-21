import { JoyConIO } from '.'
import { ioEvents } from '../../enum'

export class JoyConL {
	static selectThreshold = 0.4
	static decideButtons = ['l', 'zl', 'leftStick']
	constructor(io, joyCon) {
		this.io = io
		this.game = io.game
		this.joyCon = joyCon
		this.pastInputStatus = null
		this.averageAccelerometer = 0
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = [0]
	}
	start() {
		this.joyCon.addEventListener('hidinput', ({ detail }) => {
			if (detail.accelerometers) {
				this.recentAccelerometers.push(detail.accelerometers[0].z.acc)
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
				right: this.averageAccelerometer < -JoyConL.selectThreshold,
				left: JoyConL.selectThreshold < this.averageAccelerometer,
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
	inputChange(key, newState) {
		switch (true) {
			case (JoyConL.decideButtons.includes(key) && newState):
				this.game.emit(ioEvents.decided)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.game.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
				break

			case key === 'right':
				this.game.emit(ioEvents.rightSelected)
				this.direction = JoyConIO.directions.right
				break

			case key === 'left':
				this.game.emit(ioEvents.leftSelected)
				this.direction = JoyConIO.directions.left
				break

			default:
				break
		}
	}
}
