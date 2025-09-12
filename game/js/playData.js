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
	addQuestion({
		level,
		lives,
		correct,
		questionNo,
		questionId,
		optionIndex
	}) {
		this.questions.push({
			level,
			lives,
			correct,
			questionNo,
			questionId,
			optionIndex
		})
	}
	setKonami(value) {
		this.konami = value
	}
	setCleared(value) {
		this.cleared = value
	}
}
