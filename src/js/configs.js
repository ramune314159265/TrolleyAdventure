export class Configs {
	#dataLoader
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
		this.data = {}
	}
	async init() {
		const config = await this.#dataLoader.load('config')
		Object.entries(config).forEach(([k, v]) => this.set(k, v))
	}
	get(key) {
		return this.data[key]
	}
	set(key, value) {
		this.data[key] = value
	}
}
