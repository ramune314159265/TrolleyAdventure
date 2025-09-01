import { inputs } from '../../enum'
import { GameIO } from '../index'

export class KeyboardIO extends GameIO {
	constructor() {
		super()
		this.eventId = document.addEventListener('keydown', e => this.keyPressHandle(e.key))
	}
	connectSession(session) {
		this.session = session
	}
	keyPressHandle(key) {
		console.log(key)
		const keyMap = { a: inputs.left, s: inputs.center, d: inputs.right, w: inputs.confirm, k: inputs.konami }
		Object.keys(keyMap).includes(key) ? this.session.emit(keyMap[key]) : ''
	}
}
