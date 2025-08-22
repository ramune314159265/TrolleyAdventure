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
	constructor(game) {
		super(game)
		this.state = JoyConIO.states.ignore
		this.questionData = null
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
		const joyConData = await joyCon.getRequestDeviceInfo()
		console.log(joyConData)

		if (joyConData.type === 'Right Joy-Con') {
			new JoyConR(this, joyCon).start()
		} else if (joyConData.type === 'Left Joy-Con') {
			new JoyConL(this, joyCon).start()
		}
	}
}
