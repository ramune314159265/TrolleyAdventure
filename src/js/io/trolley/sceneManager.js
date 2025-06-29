import { Container } from '../../libraries/pixi.min.mjs'

export class SceneManager {
	constructor() {
		this.container = new Container()
		this.currentScene = null
	}
	async changeScene(scene){
		if(this.currentScene){
			await this.currentScene.exit()
			this.container.removeChild(this.scene.container)
		}
		await scene.init()
		await scene.enter()
	}
}
