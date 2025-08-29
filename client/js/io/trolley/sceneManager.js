import { Container } from 'pixi.js'
import { TrolleyIO } from './index'

export class SceneManager {
	constructor() {
		this.mainLayerContainer = new Container()
		this.transitionLayerContainer = new Container()
		TrolleyIO.instance.app.stage.addChild(this.mainLayerContainer)
		TrolleyIO.instance.app.stage.addChild(this.transitionLayerContainer)
		this.currentScene = null
	}
	async changeScene(scene, transition) {
		await this.currentScene?.exit?.()
		await transition.start()
		this.currentScene?.destroy?.()
		if (this.currentScene) {
			this.mainLayerContainer.removeChild(this.currentScene.container)
		}
		this.currentScene = scene
		await scene.init()
		this.mainLayerContainer.addChild(scene.container)
		await transition.end()
		await scene.enter?.()
	}
}
