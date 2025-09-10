import { Panel, Stats } from 'pixi-stats'
import { Application, Assets } from 'pixi.js'
import { sessionStates } from '../../enum'
import { GameIO } from '../index'
import { assetManifest } from './assets'
import { BgmManager } from './bgmManager'
import { constants } from './constants'
import { DifficultSelectScene } from './scene/difficultSelect'
import { SceneManager } from './sceneManager'
import { SeManager } from './seManager'
import { BlackFaceTransition } from './transition/blackFade'

export class TrolleyIO extends GameIO {
	static instance
	constructor() {
		super()
		TrolleyIO.instance = this

		this.parentElement = document.querySelector('#main')
		this.canvas = document.createElement('canvas')
		this.parentElement.append(this.canvas)
		const resizeHandle = () => {
			const parentWidth = this.parentElement.clientWidth
			const parentHeight = this.parentElement.clientHeight

			if ((parentWidth / parentHeight) > constants.viewAspectRatio) {
				this.canvas.style.height = `${parentHeight}px`
				this.canvas.style.width = `${parentHeight * constants.viewAspectRatio}px`
			} else {
				this.canvas.style.width = `${parentWidth}px`
				this.canvas.style.height = `${parentWidth / constants.viewAspectRatio}px`
			}
		}
		window.addEventListener('resize', resizeHandle)
		window.dispatchEvent(new Event('resize'))
	}
	connectSession(session) {
		this.session = session
		session.onAny(console.log)
		session.once(sessionStates.selectingDifficult, async ({ difficulties }) => {
			await this.init()
			const transition = new BlackFaceTransition(this.sceneManager.transitionLayerContainer)
			const difficultSelectScene = new DifficultSelectScene({ difficulties })
			this.sceneManager.changeScene(difficultSelectScene, transition)
		})
	}
	async init() {
		if (this.app) {
			this.app.destroy(true, {
				children: true,
				textureSource: true,
				context: true
			})
			this.canvas = document.createElement('canvas')
			this.parentElement.append(this.canvas)
			window.dispatchEvent(new Event('resize'))
		} else {
			await Assets.init({ manifest: assetManifest })
			await Assets.loadBundle('first_load')
		}
		this.app = new Application()
		await this.app.init({
			background: '#000000',
			width: constants.viewWidth,
			height: constants.viewHeight,
			canvas: this.canvas,
		})
		if (import.meta.env.PROD) {
			this.app.renderer.events.cursorStyles.default = 'none'
			this.app.canvas.addEventListener('contextmenu', e => e.preventDefault())
			navigator.wakeLock.request('screen')
		}
		if (!import.meta.env.PROD) {
			window.__PIXI_DEVTOOLS__ = { app: this.app }
			Object.defineProperty(Panel.prototype, 'averageValue', {
				get() {
					return Math.ceil(this.values.at(-1) * 10) / 10
				}
			})
			const stats = new Stats(this.app.render, document.querySelector('#main'))
			const tickersPanel = new Panel('Tickers', '#eb07aa', '#380129')
			const eventsPanel = new Panel('EL', '#e8130c', '#420806')
			setInterval(() => {
				tickersPanel.update(this.app.ticker.count, 32)
				eventsPanel.update(this.session.getAllEventListeners().length, 32)
			}, 100)
			stats.addPanel(tickersPanel)
			stats.addPanel(eventsPanel)
			stats.showPanel(0)
		}

		this.sceneManager = new SceneManager()
		this.bgmManager = new BgmManager()
		this.seManager = new SeManager()
	}
}
