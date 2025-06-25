export class Configs {
	#dataLoader
	#data
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
		this.#data = {}
	}
	get(key) {
		return this.#data[key]
	}
	set(key, value) {
		this.#data[key] = value
	}
	async init() {
		const config = await this.#dataLoader.load('config')
		Object.entries(config).forEach((k, v) => this.set(k, v))
	}
}
