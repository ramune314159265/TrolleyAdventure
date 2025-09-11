import { randomFromArray } from './util/random'

export class QuestionManager {
	static maxLevel = 5
	#dataLoader
	constructor({ dataLoader }) {
		this.#dataLoader = dataLoader
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
		const levelPerQuestions = Math.floor(this.allQuestions.length / QuestionManager.maxLevel)
		const questionsAccuracySorted = this.allQuestions.sort((a, b) => b.option.accuracy - a.option.accuracy)
		const targetLevelQuestions = questionsAccuracySorted.slice((level - 1) * levelPerQuestions, (level - 1) * levelPerQuestions + levelPerQuestions)
		const questionsFiltered = targetLevelQuestions
			.filter(question => !this.pickedIds.includes(question.id))
			.filter(question => Object.entries(filter).every(([k, v]) => question[k] === v))
		const question = randomFromArray(questionsFiltered)
		if (!question) {
			return null
		}
		this.pickedIds.push(question.id)
		return question
	}
}
