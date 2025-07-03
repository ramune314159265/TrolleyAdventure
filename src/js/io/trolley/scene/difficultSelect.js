import { Assets, Container, Sprite } from '../../../libraries/pixi.mjs'
import { blinkText } from '../component/blinkText.js'
import { hologramContainer } from '../component/hologramContainer.js'
import { mainText } from '../component/mainText.js'
import { colors, constants } from '../constants.js'
import { TrolleyIO } from '../index.js'

export class DifficultSelectScene {
	constructor() {
		this.container = new Container()
	}
	async init() {
		await Assets.loadBundle('difficult_select')

		const backgroundTexture = await Assets.load('background')
		const background = new Sprite(backgroundTexture)
		background.width = constants.viewWidth
		background.height = constants.viewHeight
		this.container.addChild(background)

		const topText = blinkText({
			content: '難易度を選んでください',
			styleOverride: {
				fontSize: 72
			}
		})
		topText.x = constants.viewWidth / 2
		topText.y = 72
		this.container.addChild(topText)

		const mapsContainer = new Container()
		mapsContainer.x = constants.viewWidth / 2
		mapsContainer.y = 425
		const mapPositions = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
		mapPositions.forEach((p, i) => {
			const difficultData = Object.values(TrolleyIO.instance.sentData.difficultList)[i]
			const innerContainer = new Container()
			const hologramWidth = 550
			const hologramHeight = 270
			const hologram = hologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: difficultData.hologram_color ?? colors.hologramMain,
				innerContainer,
			})
			mapsContainer.addChild(hologram)
			hologram.x = (constants.viewWidth / 4) * p[0]
			hologram.y = 150 * p[1]
			const difficultName = mainText({
				content: difficultData.name,
				styleOverride: {
					fill: difficultData.text_color ?? colors.hologramText,
					fontSize: 72,
				}
			})
			difficultName.anchor.y = 0
			difficultName.x = hologramWidth / 2
			difficultName.y = 10
			innerContainer.addChild(difficultName)
			const difficultDescription = mainText({
				content: difficultData.description,
				styleOverride: {
					fill: difficultData.text_color ?? colors.hologramText,
					fontSize: 48,
					lineHeight: 64
				}
			})
			difficultDescription.anchor.y = 0
			difficultDescription.x = hologramWidth / 2
			difficultDescription.y = 75
			innerContainer.addChild(difficultDescription)
		})

		this.container.addChild(mapsContainer)
	}
}
