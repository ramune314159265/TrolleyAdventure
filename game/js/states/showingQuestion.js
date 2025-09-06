import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingChoicesState } from './showingChoices'

export class ShowingQuestionState extends State {
	constructor({ session }) {
		super({ session })
		this.timeoutId = -1
	}
	enter() {
		this.session.nextQuestion()
		this.emit(sessionStates.showingQuestion, {
			content: this.session.questionData.content,
			level: this.session.level,
			accuracy: this.session.questionData.option.accuracy,
			questionNo: this.session.questionNo + 1,
			lives: this.session.lives
		})
		this.on(inputs.next, () => {
			this.on(inputs.confirm, () => {
				this.session.enterState(new ShowingChoicesState({ session: this.session }))
				clearTimeout(this.timeoutId)
			})
			this.timeoutId = setTimeout(() => {
				this.session.enterState(new ShowingChoicesState({ session: this.session }))
			}, 500 + 1000 * this.session.questionData.content.length / this.session.configs.get('cps'))
		})
	}
}
