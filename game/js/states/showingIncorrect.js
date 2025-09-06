import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { ShowingExplanationState } from './showingExplanation'

export class ShowingIncorrectState extends State {
	constructor({ session, index }) {
		super({ session })
		this.index = index
	}
	enter() {
		this.emit(sessionStates.showingIncorrect, { lives: this.session.lives, index: this.index })
		this.on(inputs.next, () => {
			this.session.enterState(new ShowingExplanationState({ session: this.session }))
		})
	}
}
