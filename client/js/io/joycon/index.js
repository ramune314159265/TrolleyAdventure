import { connectJoyCon, connectedJoyCons } from 'joy-con-webhid'
import { wait } from '../../util/wait'
import { GameIO } from '../index'
import { JoyConL } from './joyconL'
import { JoyConR } from './joyconR'

export class JoyConIO extends GameIO {
	constructor() {
		super()

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
	connectSession(session) {
		this.session = session
	}
	async joyConHandle(joyCon) {
		joyCon.eventListenerAttached = true
		await joyCon.open()
		await wait(50)
		await joyCon.enableStandardFullMode()
		await wait(50)
		await joyCon.setLED(0)
		await wait(50)
		await joyCon.enableIMUMode()
		await wait(50)
		console.log(joyCon)
		this.joyCon = joyCon
		const joyConData = await joyCon.getRequestDeviceInfo()
		await wait(50)

		if (joyConData.type === 'Right Joy-Con') {
			new JoyConR(this, joyCon).start()
		} else if (joyConData.type === 'Left Joy-Con') {
			new JoyConL(this, joyCon).start()
		}
	}
}
