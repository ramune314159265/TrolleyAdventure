export class DifficultManager {
	#dataLoader
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
		this.difficult = 'normal'
		this.difficultConfigs = {}
	}
	async init() {
		const data = await this.#dataLoader.load('difficulties')
		data.forEach(d => this.difficultConfigs[d.id] = d)
	}
	setDifficult(id) {
		this.difficult = id
	}
	getDifficultConfig(key) {
		if (!key) {
			return this.difficultConfigs[this.difficult]
		}
		return this.difficultConfigs[this.difficult][key]
	}
}
