import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingChoicesState } from './showingChoices'

export class ShowingQuestionState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.session.nextQuestion()
		this.emit(sessionStates.showingQuestion, {
			content: this.session.questionData.content,
			level: this.session.level,
			questionNo: this.session.questionNo + 1
		})
		this.on(inputs.confirm, () => {
			this.session.enterState(new ShowingChoicesState({ session: this.session }))
		})
	}
}
