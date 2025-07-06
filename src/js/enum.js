export const gameEvents = Object.freeze({
	sessionInitializing: Symbol('sessionInitializing'),
	sessionLoaded: Symbol('sessionLoaded'),
	gameStarted: Symbol('gameStarted'),
	nextQuestionStarted: Symbol('nextQuestionStarted'),
	gameOvered: Symbol('gameOvered'),
	gameCleared: Symbol('gameCleared')
})

export const ioCommands = Object.freeze({
	gameStart: Symbol('gameStart'),
	answerQuestion: Symbol('answerQuestion')
})

export const ioEvents = Object.freeze({
	leftSelected: Symbol('leftSelected'),
	rightSelected: Symbol('rightSelected'),
	deselected: Symbol('deselected')
})