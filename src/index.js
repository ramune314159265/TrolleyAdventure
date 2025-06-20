import { Game } from './js'

const run = () => {
	const gameMain = new Game({})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
