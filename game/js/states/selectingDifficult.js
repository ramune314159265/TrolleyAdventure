import { State } from '.'
import { inputs, outputs, sessionStates } from '../enum'
import { mod } from '../util/mod'
import { WaitingStageState } from './waitingStage'

export class SelectingDifficultState extends State {
	constructor({ session }) {
		super({ session })
		this.selectingIndex = 0
	}
	enter() {
		this.emit(sessionStates.selectingDifficult, { difficulties: this.session.difficultManager.difficultConfigs })
		const move = offset => {
			const previousIndex = this.selectingIndex
			this.selectingIndex = mod(offset + this.selectingIndex, Object.keys(this.session.difficultManager.difficultConfigs).length)
			this.emit(outputs.changeSelectingDifficult, { index: this.selectingIndex, previousIndex })
		}
		this.on(inputs.right, () => {
			move(1)
		})
		this.on(inputs.left, () => {
			move(-1)
		})
		this.on(inputs.konami, () => {
			this.session.lives = 2 ** 31 - 1
		})
		this.on(inputs.confirm, () => {
			this.session.start({ difficultId: Object.keys(this.session.difficultManager.difficultConfigs)[this.selectingIndex] })
			this.emit(outputs.selectedDifficult, { index: this.selectingIndex })
			this.session.enterState(new WaitingStageState({ session: this.session }))
		})
	}
}
