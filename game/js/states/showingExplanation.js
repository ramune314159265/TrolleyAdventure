import { State } from '.'
import { inputs, sessionStates } from '../enum'
import { WaitingStageState } from './waitingStage'

export class ShowingExplanationState extends State {
	constructor({ session }) {
		super({ session })
		this.timeoutId = -1
	}
	enter() {
		const timerMs = 3000 + 1000 * (this.session.questionData.answer.explanation + this.session.questionData.option.explanation).length / 20
		this.emit(sessionStates.showingExplanation, {
			correctContent: this.session.questionData.answer.explanation,
			incorrectContent: this.session.questionData.option.explanation,
			imageUrl: this.session.questionData.answer.explanationImage,
			timerMs
		})
		const next = () => {
			clearInterval(this.timeoutId)
			this.session.enterState(new WaitingStageState({ session: this.session }))
		}
		this.on(inputs.confirm, () => {
			next()
		})
		this.timeoutId = setTimeout(() => {
			next()
		}, timerMs)
	}
}
