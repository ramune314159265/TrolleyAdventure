export const gameEvents = Object.freeze({
	sessionInitializing: Symbol('sessionInitializing'),
	sessionLoaded: Symbol('sessionLoaded'),
	gameStarted: Symbol('gameStarted'),
	nextQuestionStarted: Symbol('nextQuestionStarted'),
	gameOvered: Symbol('gameOvered'),
})

export const ioCommands = Object.freeze({
	gameStart: Symbol('gameStart'),
	answerQuestion: Symbol('answerQuestion')
})
