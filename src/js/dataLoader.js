export class DataLoader {
	static dataIds = ['questions', 'difficulties']
	constructor() {
		this.cache = new Map()
	}
	async loadAll() {
		await Promise.all(
			DataLoader.dataIds.map(async id => this.load(id))
		)
	}
	async load(id) {
		const data = await (await fetch(`./data/${id}.json`)).json()
		this.cache.set(id, data)
		return data
	}
	async get(id) {
		if (this.cache.has(id)) {
			return this.cache.get(id)
		}
		return await this.load(id)
	}
}
