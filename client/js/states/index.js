import { EventReceiverDestroyable } from '../util/eventRegister'

export class State extends EventReceiverDestroyable {
	constructor({ session }) {
		super(session)
		this.session = session
		this.registeredEvents = []
	}
	enter() {

	}
	exit() {
		super.destroy()
	}
}
