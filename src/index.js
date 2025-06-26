import { Game } from './js/index.js'

const run = () => {
	const gameMain = new Game({})
	gameMain.newSession()

	document.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
