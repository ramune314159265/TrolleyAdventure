import { JoyConIO } from '.'
import { ioEvents } from '../../enum'
import { quaternionToEuler } from '../../util/quaternion'

export class JoyConL {
	static selectThreshold = Math.PI * (2/5)
	static decideButtons = ['l', 'zl', 'leftStick']
	constructor(io, joyCon) {
		this.io = io
		this.session = io.session
		this.joyCon = joyCon
		this.pastInputStatus = null
		this.direction = JoyConIO.directions.horizontal
		this.recentAccelerometers = [0]
	}
	start() {
		this.joyCon.addEventListener('hidinput', ({ detail }) => {
			const { pitch, yaw } = quaternionToEuler(this.joyCon.madgwick.getQuaternion())
			if (!this.pastInputStatus) {
				this.pastInputStatus = detail.buttonStatus
				return
			}
			const inputStatus = {
				...detail.buttonStatus,
				right: (-JoyConL.selectThreshold < pitch && yaw < 0),
				left: (-JoyConL.selectThreshold < pitch && 0 < yaw),
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
				this.session.emit(ioEvents.decided)
				break

			case (key === 'right' || key === 'left') && !newState:
				this.session.emit(ioEvents.deselected)
				this.direction = JoyConIO.directions.horizontal
				break

			case key === 'right':
				this.session.emit(ioEvents.rightSelected)
				this.direction = JoyConIO.directions.right
				break

			case key === 'left':
				this.session.emit(ioEvents.leftSelected)
				this.direction = JoyConIO.directions.left
				break

			default:
				break
		}
	}
}
