import { gameEvents } from '../../enum.js'
import { Application } from '../../libraries/pixi.min.mjs'
import { GameIO } from '../index.js'

export class TrolleyIO extends GameIO {
	constructor(game) {
		super(game)
		game.once(gameEvents.sessionLoaded, () => this.init())
	}
	async init() {
		const aspectRatio = 16 / 9
		this.app = new Application()
		await this.app.init({
			background: '#000000',
			width: 1280,
			height: 720,
		})
		const parent = document.querySelector('#main')
		parent.appendChild(this.app.view)
		window.addEventListener('resize', () => {
			const parentWidth = parent.clientWidth
			const parentHeight = parent.clientHeight

			if ((parentWidth / parentHeight) > aspectRatio) {
				this.app.view.style.height = `${parentHeight}px`
				this.app.view.style.width = `${parentHeight * aspectRatio}px`
			} else {
				this.app.view.style.width = `${parentWidth}px`
				this.app.view.style.height = `${parentWidth / aspectRatio}px`
			}
		})
	}
}
