export class Configs {
	#dataLoader
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
		this.data = {}
	}
	async init() {
		const config = await this.#dataLoader.get('config')
		Object.entries(config).forEach(([k, v]) => this.set(k, v))
	}
	get(key) {
		if (!key) {
			return this.data
		}
		return this.data[key]
	}
	set(key, value) {
		this.data[key] = value
	}
}
