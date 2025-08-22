import { MainText } from './mainText'

export class FitText extends MainText {
	constructor({ content, styleOverride, width, height, maxFontSize, minFontSize }) {
		super({ content, styleOverride })
		let fontSize = maxFontSize

		while (minFontSize <= fontSize) {
			this.style.fontSize = fontSize
			if (this.width <= width && this.height <= height) {
				break
			}
			fontSize--
		}
	}
}
