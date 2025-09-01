import { MainText } from './mainText'

export class FitText extends MainText {
	constructor({ content, styleOverride, width, height, maxFontSize, minFontSize }) {
		super({ content, styleOverride })
		this.maxFontSize = maxFontSize
		this.minFontSize = minFontSize
		this.textWidth = width
		this.textHeight = height
		this.setText(content)
	}
	setText(content) {
		this.text = content
		let fontSize = this.maxFontSize

		while (this.minFontSize <= fontSize) {
			this.style.fontSize = fontSize
			if (this.width <= this.textWidth && this.height <= this.textHeight) {
				break
			}
			fontSize -= 4
		}
	}
}
