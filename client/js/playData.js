export class PlayData {
	constructor() {
		this.difficult = ''
		this.questions = []
		this.konami = false
		this.cleared = false
	}
	getDataJson() {
		return JSON.stringify(this)
	}
	setDifficult(id) {
		this.difficult = id
	}
	addQuestion(data) {
		this.questions.push({
			level: data.level,
			lives: data.lives,
			isCorrect: data.isCorrect,
			questionNo: data.questionNo,
			questionId: data.questionData.id,
			optionIndex: data.questionData.optionIndex
		})
	}
	setKonami(value) {
		this.konami = value
	}
	setCleared(value) {
		this.cleared = value
	}
}
