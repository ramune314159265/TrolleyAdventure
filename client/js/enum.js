export const gameEvents = Object.freeze({
	sessionInitializing: Symbol('sessionInitializing'),
	sessionLoaded: Symbol('sessionLoaded'),
	gameStarted: Symbol('gameStarted'),
	nextQuestionStarted: Symbol('nextQuestionStarted'),
	gameOvered: Symbol('gameOvered'),
	gameCleared: Symbol('gameCleared'),
	sessionEnded: Symbol('sessionEnded')
})

export const ioCommands = Object.freeze({
	gameStart: Symbol('gameStart'),
	answerQuestion: Symbol('answerQuestion'),
	gameEnd: ('gameEnd'),
	konamiCommand: Symbol('konamiCommand')
})

export const ioEvents = Object.freeze({
	leftSelected: Symbol('leftSelected'),
	rightSelected: Symbol('rightSelected'),
	deselected: Symbol('deselected'),
	decided: Symbol('decided'),
})
