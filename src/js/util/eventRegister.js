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
		this.#events[name].push(new EventData({ func, name }))
	}
	once(name, func) {
		this.#events[name] ??= []
		this.#events[name].push(new EventData({ func, name, once: true }))
	}
	onAny(func) {
		this.#anyEvents.push(new EventData({ func }))
	}
	emit(name, ...arg) {
		this.#anyEvents.forEach(data => data.func(name, ...arg))
		this.#events[name]?.forEach(data => data.func(...arg))
		this.#events[name] = this.#events[name]?.filter(data => !data.once)
	}
}
