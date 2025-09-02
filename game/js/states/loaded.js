import { State } from '.'
import { sessionStates } from '../enum'
import { SelectingDifficultState } from './selectingDifficult'

export class LoadedState extends State {
	constructor({ session }) {
		super({ session })
	}
	enter() {
		this.emit(sessionStates.loaded, { configs: this.session.configs })
		this.session.enterState(new SelectingDifficultState({ session: this.session }))
	}
}
