import { Game } from './js/index'

const run = () => {
	const gameMain = new Game({})
	gameMain.newSession()

	document.addEventListener('click', () => {
		console.log(gameMain)
	})

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./sw.js')
			.then(reg => console.log('Service Worker registered', reg))
			.catch(err => console.error('SW registration failed', err))
	}
}

run()
