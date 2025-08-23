export class QuestionManager {
	#dataLoader
	#configs
	constructor({ dataLoader, configs }) {
		this.#dataLoader = dataLoader
		this.#configs = configs
		this.pickedIds = []
	}
	async init() {
		const data = await this.#dataLoader.get('questions')
		this.allQuestions = data.flatMap(question => {
			return question.options.map((optionData, optionIndex) => {
				question.answer.isCorrect = true
				optionData.isCorrect = false
				return {
					...question,
					option: optionData,
					optionIndex,
					options: [question.answer, optionData].toSorted(() => Math.random() - 0.5)
				}
			})
		})
	}
	pickQuestion(level, filter = {}) {
		const levelPerQuestions = Math.floor(this.allQuestions.length / this.#configs.get('max_level'))
		const questionsAccuracySorted = this.allQuestions.sort((a, b) => b.option.accuracy - a.option.accuracy)
		const targetLevelQuestions = questionsAccuracySorted.slice((level - 1) * levelPerQuestions, (level - 1) * levelPerQuestions + levelPerQuestions)
		const questionsFiltered = targetLevelQuestions
			.filter(question => !this.pickedIds.includes(question.id))
			.filter(question => Object.entries(filter).every(([k, v]) => question[k] === v))
		const question = questionsFiltered[Math.floor(questionsFiltered.length * Math.random())]
		this.pickedIds.push(question.id)
		return question
	}
}
