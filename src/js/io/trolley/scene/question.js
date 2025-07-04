import { Container } from '../../../libraries/pixi.mjs'
import { QuestionFirstInfoComponent } from '../component/questionFirstInfo.js'

export class QuestionScene {
	constructor() {
		this.container = new Container()
	}
	async init() {
		const questionFirstInfo = new QuestionFirstInfoComponent({ questionNo: 1, level: 1 })
		this.container.addChild(questionFirstInfo)
		questionFirstInfo.show()
	}
}
