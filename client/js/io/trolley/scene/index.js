import { Container } from 'pixi.js'

export class Scene {
	constructor() {
		this.container = new Container
	}
	async init() { }
	async enter() { }
	async end() { }
	destroy() {
		this.container.destroy({ children: true })
	}
}
