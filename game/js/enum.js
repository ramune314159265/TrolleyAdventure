export const sessionStates = Object.freeze({
	loaded: Symbol('loaded'),
	selectingDifficult: Symbol('selectingDifficult'),
	waitingStage: Symbol('waitingStage'),
	showingQuestion: Symbol('showingQuestion'),
	showingChoices: Symbol('showingChoices'),
	showingCorrect: Symbol('showingCorrect'),
	showingIncorrect: Symbol('showingIncorrect'),
	showingExplanation: Symbol('showingExplanation'),
	timeOver: Symbol('timeOver'),
	gameOver: Symbol('gameOver'),
	gameClear: Symbol('gameClear'),
	ended: Symbol('ended')
})

export const inputs = Object.freeze({
	left: Symbol('left'),
	center: Symbol('center'),
	right: Symbol('right'),
	confirm: Symbol('confirm'),
	konami: Symbol('konami'),
	next: Symbol('next')
})

export const outputs = Object.freeze({
	start: Symbol('start'),
	changeAvailableControls: Symbol('changeAvailableControls'),

	changeSelectingDifficult: Symbol('changeSelectingDifficult'),
	selectedDifficult: Symbol('selectedDifficult'),

	selectedChoice: Symbol('selectedChoice'),
	deselectedChoice: Symbol('deselectedChoice'),
	decidedChoice: Symbol('decidedChoice')
})
