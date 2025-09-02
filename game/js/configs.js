import { parseObjects } from './util/parse'

export class Configs {
	#dataLoader
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
		this.data = {}
	}
	async init() {
		const config = await this.#dataLoader.get('config')
		const url = new URL(location.href)
		const params = [...url.searchParams.entries()]
		Object.entries(config).forEach(([k, v]) => this.set(k, v))
		params.forEach(([k, v]) => this.set(k, parseObjects(v)))
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
