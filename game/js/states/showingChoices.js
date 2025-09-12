import { State } from '.'
import { inputs, outputs, sessionStates } from '../enum'
import { GameOverState } from './gameOver'
import { ShowingCorrectState } from './showingCorrect'
import { ShowingIncorrectState } from './showingIncorrect'

export class ShowingChoicesState extends State {
	constructor({ session }) {
		super({ session })
		this.selected = null
		this.lastSelected = null
		this.optionTimeoutId = -1
		this.globalTimeoutId = -1
	}
	enter() {
		const globalTimerMs = this.session.difficultManager.getDifficultConfig('time_limit') * 1000
		const optionTimerMs = this.session.difficultManager.getDifficultConfig('selected_time_limit') * 1000
		this.emit(sessionStates.showingChoices, {
			choices: this.session.questionData.options,
			timerMs: globalTimerMs
		})
		const decide = index => {
			clearTimeout(this.optionTimeoutId)
			clearTimeout(this.globalTimeoutId)
			this.emit(outputs.decidedChoice, { index })
			this.emit(outputs.changeAvailableControls, { controls: {} })
			const isCorrect = this.session.questionData.options[index].isCorrect
			this.session.lives -= isCorrect ? 0 : 1
			this.session.playData.addQuestion({
				level: this.session.level,
				lives: this.session.lives,
				correct: isCorrect,
				questionNo: this.session.questionNo,
				questionId: this.session.questionData.id,
				optionIndex: this.session.questionData.optionIndex,
			})
			switch (true) {
				case this.session.lives <= 0 && !isCorrect:
					this.session.enterState(new GameOverState({ session: this.session, index }))
					break

				case isCorrect:
					this.session.enterState(new ShowingCorrectState({ session: this.session, index }))
					break

				case !isCorrect:
					this.session.enterState(new ShowingIncorrectState({ session: this.session, index }))
					break

				default:
					break
			}
		}
		const select = index => {
			this.emit(outputs.selectedChoice, { index, timerMs: optionTimerMs })
			this.selected = index
			this.lastSelected = index
			clearTimeout(this.optionTimeoutId)
			this.emit(outputs.changeAvailableControls, { controls: { a: '確定' } })
			this.optionTimeoutId = setTimeout(() => {
				decide(index)
			}, optionTimerMs)
		}
		this.on(inputs.left, () => select(0))
		this.on(inputs.right, () => select(1))
		this.on(inputs.center, () => {
			if (this.selected !== null) {
				this.emit(outputs.deselectedChoice, { index: this.selected })
				this.emit(outputs.changeAvailableControls, { controls: {} })
			}
			this.selected = null
			clearTimeout(this.optionTimeoutId)
		})
		this.on(inputs.confirm, () => {
			if (this.selected === null) {
				return
			}
			decide(this.selected)
		})
		const timeOver = () => {
			if (this.lastSelected !== null) {
				decide(this.lastSelected)
			}

		}
		this.globalTimeoutId = setTimeout(() => {
			timeOver()
		}, globalTimerMs)
	}
}
