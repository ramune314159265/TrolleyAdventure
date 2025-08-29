export class State {
	constructor({ session }) {
		this.session = session
		this.registeredEvents = []
	}
	on(name, func) {
		this.registeredEvents.push(this.session.on(name, func))
	}
	onAny(eventData) {
		this.registeredEvents.push(this.session.onAny(eventData))
	}
	emit(name, ...arg) {
		this.session.emit(name, ...arg)
	}
	enter() {

	}
	exit() {
		this.registeredEvents.forEach(e => {
			this.session.off(e)
			this.session.offAny(e)
		})
	}
}
