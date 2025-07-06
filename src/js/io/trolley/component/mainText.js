import { Text } from 'pixi.js'

export class MainText extends Text {
	constructor({ content, styleOverride }) {
		super({
			text: content,
			style: {
				fontSize: 36,
				fontFamily: 'Main',
				fill: {
					color: '#ffffff'
				},
				dropShadow: {
					color: '#000000',
					distance: 6,
					angle: Math.PI / 4
				},
				...styleOverride
			}
		})
		this.anchor.x = 0.5
		this.anchor.y = 0.5
	}
}
