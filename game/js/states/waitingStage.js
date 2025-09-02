import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingQuestionState } from './showingQuestion'

export class WaitingStageState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.waitingStage)
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingQuestionState({ session: this.session }))
		})
	}
}
