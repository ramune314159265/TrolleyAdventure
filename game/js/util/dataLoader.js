const resources = {
	questions: [
		'/api/questions/',
		'./data/questions.json'
	],
	difficulties: [
		'/api/difficulties/',
		'./data/difficulties.json'
	],
	config: ['./data/config.json'],
}

export class DataLoader {
	constructor() {
		this.cache = new Map()
	}
	async loadAll() {
		await Promise.all(
			Object.keys(resources).map(async id => this.load(id))
		)
	}
	async load(id, attempt = 0) {
		try {
			const data = await (await fetch(resources[id][attempt])).json()
			this.cache.set(id, data)
			return data
		} catch {
			if (!resources[id][attempt + 1]) {
				throw new Error(`resource ${id} couldn't be loaded`)
			}
			return await this.load(id, attempt + 1)
		}
	}
	async get(id) {
		if (this.cache.has(id)) {
			return this.cache.get(id)
		}
		return await this.load(id)
	}
}
