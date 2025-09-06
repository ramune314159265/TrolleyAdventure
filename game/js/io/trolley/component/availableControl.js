import { Container, Graphics } from 'pixi.js'
import { colors } from '../constants'
import { MainText } from './mainText'

export class AvailableControl extends Container {
	static iconSize = 24
	constructor({ button, actionName }) {
		super()
		this.icon = new Graphics()
		this.icon
			.circle(AvailableControl.iconSize / 2, AvailableControl.iconSize / 2, AvailableControl.iconSize)
			.fill({
				color: colors.hologramMain
			})
		this.icon.x = AvailableControl.iconSize / 2
		this.icon.y = AvailableControl.iconSize / 2
		this.addChild(this.icon)
		this.buttonText = new MainText({
			content: button.toUpperCase(),
			styleOverride: {
				fontSize: 48,
			}
		})
		this.buttonText.x = this.width / 2
		this.buttonText.y = this.height / 2
		this.addChild(this.buttonText)
		this.actionText = new MainText({
			content: actionName,
			styleOverride: {
				fontSize: 48,
			}
		})
		this.actionText.anchor.x = 0
		this.actionText.x = AvailableControl.iconSize + 32
		this.actionText.y = this.height / 2
		this.addChild(this.actionText)
	}
}

export class AvailableControls extends Container {
	constructor() {
		super()
	}
	setControls({ controls }) {
		this.removeChildren()
		Object.entries(controls).forEach(([button, actionName]) => {
			const availableControl = new AvailableControl({ button, actionName })
			availableControl.x = this.width + 64
			this.addChild(availableControl)
		})
	}
}
