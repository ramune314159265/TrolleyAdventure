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
	constructor(game) {
		super(game)
		TrolleyIO.instance = this
		this.gameInfo = null
		this.difficultData
		this.questionInfo = null
		this.state = null
		game.onAny(console.log)
		game.once(gameEvents.gameStarted, ({ difficultData }) => {
			this.difficultData = difficultData
			this.gameStart()
		})
		game.on(gameEvents.nextQuestionStarted, data => {
			this.questionInfo = data
		})
		game.on(gameEvents.gameCleared, () => {
			this.state = TrolleyIO.states.gameClear
		})
		game.on(gameEvents.gameOvered, () => {
			this.state = TrolleyIO.states.gameOver
		})
		game.once(gameEvents.sessionLoaded, async data => {
			this.gameInfo = data
			await this.init()
			this.difficultSelect()
		})
	}
	async init() {
		this.app = new Application()
		await this.app.init({
			background: '#000000',
			width: constants.viewWidth,
			height: constants.viewHeight,
		})
		const parent = document.querySelector('#main')
		parent.appendChild(this.app.canvas)
		window.__PIXI_DEVTOOLS__ = { app: this.app }
		const resizeHandle = () => {
			const parentWidth = parent.clientWidth
			const parentHeight = parent.clientHeight

			if ((parentWidth / parentHeight) > constants.viewAspectRatio) {
				this.app.canvas.style.height = `${parentHeight}px`
				this.app.canvas.style.width = `${parentHeight * constants.viewAspectRatio}px`
			} else {
				this.app.canvas.style.width = `${parentWidth}px`
				this.app.canvas.style.height = `${parentWidth / constants.viewAspectRatio}px`
			}
		}
		window.addEventListener('resize', resizeHandle)
		resizeHandle()

		this.sceneManager = new SceneManager()

		await Assets.init({ manifest: assetManifest })
		await Assets.loadBundle('first_load')
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
