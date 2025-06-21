import { Game } from './js/index.js'

const run = () => {
	const gameMain = new Game({})

	document.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
