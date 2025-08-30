import { Container } from 'pixi.js'
import { TrolleyIO } from '..'
import { EventReceiverDestroyable } from '../../../util/eventRegister'

export class Scene extends EventReceiverDestroyable {
	constructor() {
		super(TrolleyIO.instance.session)
		this.container = new Container
	}
	async init() { }
	async enter() { }
	async end() { }
	destroy() {
		super.destroy()
		this.container.destroy({ children: true })
	}
}
