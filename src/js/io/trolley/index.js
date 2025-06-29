import { gameEvents } from '../../enum.js'
import { Application, Assets } from '../../libraries/pixi.min.mjs'
import { GameIO } from '../index.js'
import { assetManifest } from './assets.js'
import { constants } from './constants.js'
import { DifficultSelectScene } from './scene/difficultSelect.js'

export class TrolleyIO extends GameIO {
	constructor(game) {
		super(game)
		game.onAny(console.log)
		game.once(gameEvents.sessionLoaded, data => this.init(data))
	}
	async init(data) {
		this.sentData = data
		this.app = new Application()
		await this.app.init({
			background: '#000000',
			width: constants.viewWidth,
			height: constants.viewHeight,
		})
		const parent = document.querySelector('#main')
		parent.appendChild(this.app.view)
		window.__PIXI_DEVTOOLS__ = { app: this.app }
		const resizeHandle = () => {
			const parentWidth = parent.clientWidth
			const parentHeight = parent.clientHeight

			if ((parentWidth / parentHeight) > constants.viewAspectRatio) {
				this.app.view.style.height = `${parentHeight}px`
				this.app.view.style.width = `${parentHeight * constants.viewAspectRatio}px`
			} else {
				this.app.view.style.width = `${parentWidth}px`
				this.app.view.style.height = `${parentWidth / constants.viewAspectRatio}px`
			}
		}
		window.addEventListener('resize', resizeHandle)
		resizeHandle()

		await Assets.init({ manifest: assetManifest })
		await Assets.loadBundle('first_load')

		const difficultSelectScene = new DifficultSelectScene({ io: this })
		this.app.stage.addChild(difficultSelectScene.container)
	}
}
