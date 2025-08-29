import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { WaitingStageState } from './waitingStage'

export class ShowingExplanationState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.showingExplanation, {
			correctContent: this.session.questionData.answer.explanation,
			incorrectContent: this.session.questionData.option.explanation,
			imageUrl: this.session.questionData.answer.explanationImage
		})
		this.on(inputs.confirm, () => {
			this.session.enterState(new WaitingStageState({ session: this.session }))
		})
	}
}
