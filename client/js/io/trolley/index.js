import { Application, Assets } from 'pixi.js'
import { gameEvents } from '../../enum'
import { GameIO } from '../index'
import { assetManifest } from './assets'
import { constants } from './constants'
import { DifficultSelectScene } from './scene/difficultSelect'
import { QuestionScene } from './scene/question'
import { SceneManager } from './sceneManager'
import { BlackFaceTransition } from './transition/blackFade'

export class TrolleyIO extends GameIO {
	static states = {
		difficultSelect: Symbol(),
		quiz: Symbol(),
		gameClear: Symbol(),
		gameOver: Symbol(),
	}
	static instance
	constructor() {
		super()
		TrolleyIO.instance = this
		this.gameInfo = null
		this.difficultData
		this.questionInfo = null
		this.state = null

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
		session.once(gameEvents.gameStarted, ({ difficultData }) => {
			this.difficultData = difficultData
			this.gameStart()
		})
		session.on(gameEvents.nextQuestionStarted, data => {
			this.questionInfo = data
		})
		session.on(gameEvents.gameCleared, () => {
			this.state = TrolleyIO.states.gameClear
		})
		session.on(gameEvents.gameOvered, () => {
			this.state = TrolleyIO.states.gameOver
		})
		session.once(gameEvents.sessionLoaded, async data => {
			this.gameInfo = data
			await this.init()
			this.difficultSelect()
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
			canvas: this.canvas
		})
		window.__PIXI_DEVTOOLS__ = { app: this.app }

		this.sceneManager = new SceneManager()
	}
	difficultSelect() {
		this.state = TrolleyIO.states.difficultSelect
		const transition = new BlackFaceTransition(this.sceneManager.transitionLayerContainer)
		const difficultSelectScene = new DifficultSelectScene()
		this.sceneManager.changeScene(difficultSelectScene, transition)
	}
	gameStart() {
		this.state = TrolleyIO.states.quiz
		const transition = new BlackFaceTransition(this.sceneManager.transitionLayerContainer)
		const questionScene = new QuestionScene()
		this.sceneManager.changeScene(questionScene, transition)
	}
}
