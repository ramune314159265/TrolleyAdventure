class EventData {
	constructor({
		func,
		name,
		once
	}) {
		this.func = func
		this.name = name ?? null
		this.once = once ?? false
	}
}

export class EventRegister {
	#events = {}
	#anyEvents = []

	on(name, func) {
		this.#events[name] ??= []
		const eventData = new EventData({ func, name })
		this.#events[name].push(eventData)
		return eventData
	}
	off(eventData) {
		this.#events[eventData.name] = this.#events[eventData.name]?.filter(data => data !== eventData)
	}
	once(name, func) {
		this.#events[name] ??= []
		const eventData = new EventData({ func, name, once: true })
		this.#events[name].push(eventData)
		return eventData
	}
	onAny(func) {
		const eventData = new EventData({ func })
		this.#anyEvents.push(eventData)
		return eventData
	}
	offAny(eventData) {
		this.#anyEvents = this.#anyEvents.filter(data => data !== eventData)
	}
	emit(name, ...arg) {
		this.#anyEvents.forEach(data => data.func(name, ...arg))
		this.#events[name]?.forEach(data => data.func(...arg))
		this.#events[name] = this.#events[name]?.filter(data => !data.once)
	}
	getAllEventListeners() {
		return [
			...Reflect.ownKeys(this.#events).reduce((array, key) => [...array, ...(this.#events[key] ?? [])], []),
			...this.#anyEvents
		]
	}
}

export class EventReceiverDestroyable {
	constructor(target) {
		this.target = target
		this.registeredEvents = []
	}
	on(name, func) {
		const eventData = this.target.on(name, func)
		this.registeredEvents.push(eventData)
		return eventData
	}
	onAny(func) {
		const eventData = this.target.onAny(func)
		this.registeredEvents.push(eventData)
		return eventData
	}
	once(name, func) {
		const eventData = this.target.once(name, func)
		this.registeredEvents.push(eventData)
		return eventData
	}
	off(eventData) {
		this.target.off(eventData)
	}
	offAny(eventData) {
		this.target.offAny(eventData)
	}
	emit(name, ...arg) {
		this.target.emit(name, ...arg)
	}
	destroy() {
		this.registeredEvents.forEach(e => {
			this.target.off(e)
			this.target.offAny(e)
		})
	}
}
