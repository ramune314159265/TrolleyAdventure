export class QuestionManager {
	#dataLoader
	#configs
	constructor({ dataLoader, configs }) {
		this.#dataLoader = dataLoader
		this.#configs = configs
	}
	async init() {
		const data = await this.#dataLoader.load('questions')
		this.allQuestions = data.flatMap(question => {
			return question.options.map(option => {
				return {
					...question,
					option
				}
			})
		})
	}
	pickQuestion(level, filter = {}) {
		const levelPerQuestions = Math.floor(this.allQuestions.length / this.#configs.get('max_level'))
		const questionsAccuracySorted = this.allQuestions.sort((a, b) => a.option.accuracy - b.option.accuracy)
		const targetLevelQuestions = questionsAccuracySorted.slice((level - 1) * levelPerQuestions, (level - 1) * levelPerQuestions + levelPerQuestions)
		const questionsFiltered = targetLevelQuestions
			.filter(question => !this.pickedIds.includes(question.id))
			.filter(question => Object.entries(filter).every(([k, v]) => question[k] === v))
		const question = questionsFiltered[Math.floor(questionsFiltered.length * Math.random())]
		this.pickedIds.push(question.id)
		return question
	}
}
