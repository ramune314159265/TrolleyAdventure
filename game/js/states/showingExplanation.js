import { State } from '.'
import { inputs, outputs, sessionStates } from '../enum'
import { WaitingStageState } from './waitingStage'

export class ShowingExplanationState extends State {
	constructor({ session }) {
		super({ session })
		this.timeoutId = -1
	}
	enter() {
		const timerMs = 3000 + 1000 * (this.session.questionData.answer.explanation + this.session.questionData.option.explanation).length / this.session.configs.get('cps')
		this.emit(sessionStates.showingExplanation, {
			correctContent: this.session.questionData.answer.explanation,
			incorrectContent: this.session.questionData.option.explanation,
			imageUrl: this.session.questionData.answer.explanationImage,
			timerMs
		})
		this.emit(outputs.changeAvailableControls, { controls: { a: 'スキップ' } })
		const next = () => {
			clearInterval(this.timeoutId)
			this.emit(outputs.changeAvailableControls, { controls: {} })
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
