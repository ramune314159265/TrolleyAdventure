import { Assets, Container, Sprite } from 'pixi.js'
import { ioCommands } from '../../../enum'
import { wait } from '../../../util/wait'
import { BlinkText } from '../component/blinkText'
import { FilledHologramContainer } from '../component/filledHologramContainer'
import { HologramContainer } from '../component/hologramContainer'
import { MainText } from '../component/mainText'
import { colors, constants } from '../constants'
import { TrolleyIO } from '../index'

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

		const topHologramInnerContainer = new Container()
		const topHologramWidth = constants.viewWidth * 0.7
		const topHologramHeight = 125
		const topHologram = new FilledHologramContainer({
			maxWidth: topHologramWidth,
			maxHeight: topHologramHeight,
			color: colors.hologramMain,
			innerContainer: topHologramInnerContainer
		})
		topHologram.x = constants.viewWidth / 2
		topHologram.y = 108
		this.topText = new BlinkText({
			content: '難易度を選んでください',
			styleOverride: {
				fontSize: 108
			}
		})
		this.topText.x = topHologramWidth / 2
		this.topText.y = topHologramHeight / 2
		topHologramInnerContainer.addChild(this.topText)
		this.container.addChild(topHologram)

		const difficultiesContainer = new Container()
		difficultiesContainer.x = constants.viewWidth / 2
		difficultiesContainer.y = 625
		const difficultPositions = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
		difficultPositions.forEach((p, i) => {
			const difficultData = Object.values(TrolleyIO.instance.gameInfo.difficultList)[i]
			const innerContainer = new Container()
			const hologramWidth = 750
			const hologramHeight = 400
			const hologram = new HologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: difficultData.hologram_color ?? colors.hologramMain,
				innerContainer,
			})
			hologram.x = (constants.viewWidth / 4) * p[0]
			hologram.y = 225 * p[1]
			difficultiesContainer.addChild(hologram)
			hologram.show()
			const difficultName = new MainText({
				content: difficultData.name,
				styleOverride: {
					fill: difficultData.text_color ?? colors.hologramText,
					fontSize: 108,
				}
			})
			difficultName.anchor.y = 0
			difficultName.x = hologramWidth / 2
			difficultName.y = 10
			innerContainer.addChild(difficultName)
			const difficultDescription = new MainText({
				content: difficultData.description,
				styleOverride: {
					fill: difficultData.text_color ?? colors.hologramText,
					fontSize: 72,
					lineHeight: 80
				}
			})
			difficultDescription.anchor.y = 0
			difficultDescription.x = hologramWidth / 2
			difficultDescription.y = 125
			innerContainer.addChild(difficultDescription)
			TrolleyIO.instance.game.once(ioCommands.gameStart, ({ difficultId }) => {
				if (difficultData.id !== difficultId) {
					hologram.hide()
					return
				}
			})
		})

		this.container.addChild(difficultiesContainer)
	}
	async exit() {
		this.topText.text = `Let's Go!`
		await wait(2000)
	}
}
