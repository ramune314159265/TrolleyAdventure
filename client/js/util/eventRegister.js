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
}
