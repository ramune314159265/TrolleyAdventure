import { Text } from '../../../libraries/pixi.min.mjs'

export const mainText = ({ content, styleOverride }) => {
	const object = new Text(content, {
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
	})
	object.anchor.x = 0.5
	object.anchor.y = 0.5
	return object
}
