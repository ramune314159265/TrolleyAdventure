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
		this.style.fontSize = this.maxFontSize
		const ratio = Math.min(this.textWidth / this.width, this.textHeight / this.height, 1)
		this.style.fontSize = Math.floor(this.maxFontSize * ratio)
	}
}
