import { connectJoyCon, connectedJoyCons } from 'joy-con-webhid'
import { gameEvents } from '../../enum'
import { wait } from '../../util/wait'
import { GameIO } from '../index'
import { JoyConL } from './joyconL'
import { JoyConR } from './joyconR'

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
	constructor() {
		super()
		this.state = JoyConIO.states.ignore
		this.questionData = null

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
		session.once(gameEvents.sessionLoaded, data => {
			this.difficultList = data.difficultList
			this.state = JoyConIO.states.difficultSelect
		})
		session.on(gameEvents.nextQuestionStarted, data => {
			this.questionData = data.questionData
			this.state = JoyConIO.states.questionAnswer
		})
		session.on(gameEvents.gameCleared, () => {
			this.state = JoyConIO.states.ignore
		})
		session.on(gameEvents.gameOvered, () => {
			this.state = JoyConIO.states.ignore
		})
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
