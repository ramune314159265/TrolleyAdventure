import { Assets, Container, Sprite } from 'pixi.js'
import { ioCommands, ioEvents } from '../../../enum'
import { easeOutQuint } from '../../../util/easing'
import { mod } from '../../../util/mod'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
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
		topHologram.show()
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

		let selectedIndex = 0
		const hologramWidth = constants.viewWidth * 0.7
		const hologramHeight = constants.viewHeight - 350
		const gap = 200
		const difficultiesContainer = new Container()
		difficultiesContainer.x = constants.viewWidth / 2
		difficultiesContainer.y = 625
		const difficulties = Object.values(TrolleyIO.instance.gameInfo.difficultList)
		const difficultHolograms = difficulties.map((data, index) => {
			const innerContainer = new Container()
			const hologram = new HologramContainer({
				maxWidth: hologramWidth,
				maxHeight: hologramHeight,
				color: data.hologram_color ?? colors.hologramMain,
				innerContainer,
			})
			hologram.x = (hologramWidth + gap) * index
			hologram.y = 0
			difficultiesContainer.addChild(hologram)
			hologram.show()
			const difficultName = new MainText({
				content: data.name,
				styleOverride: {
					fill: data.text_color ?? colors.hologramText,
					fontSize: 160,
				}
			})
			difficultName.anchor.y = 0
			difficultName.x = hologramWidth / 2
			difficultName.y = 10
			innerContainer.addChild(difficultName)
			const difficultDescription = new MainText({
				content: data.description,
				styleOverride: {
					fill: data.text_color ?? colors.hologramText,
					fontSize: 72,
					lineHeight: 80
				}
			})
			difficultDescription.anchor.y = 0
			difficultDescription.x = hologramWidth / 2
			difficultDescription.y = 175
			innerContainer.addChild(difficultDescription)
			TrolleyIO.instance.game.once(ioCommands.gameStart, ({ difficultId }) => {
				if (data.id !== difficultId) {
					hologram.hide()
					return
				}
			})
			return hologram
		})
		const move = offset => {
			const previousIndex = selectedIndex
			selectedIndex += offset
			difficultHolograms[previousIndex]?.scale?.set?.(1)
			animateSimple(rate => {
				difficultHolograms.forEach((hologram, index) => {
					index === mod(selectedIndex, difficultHolograms.length) ? hologram.activate() : hologram.deactivate()
					const from = (hologramWidth + gap) * (index - mod(previousIndex, difficultHolograms.length))
					const to = (hologramWidth + gap) * (index - mod(selectedIndex, difficultHolograms.length))
					hologram.x = from + (to - from) * rate
				})
				difficultHolograms[selectedIndex]?.scale?.set?.(1 + 0.1 * rate)
			}, { easing: easeOutQuint, duration: 1000 })
		}
		TrolleyIO.instance.game.on(ioEvents.leftSelected, () => move(-1))
		TrolleyIO.instance.game.on(ioEvents.rightSelected, () => move(1))
		TrolleyIO.instance.game.on(ioEvents.decided, () => {
			TrolleyIO.instance.game.emit(ioCommands.gameStart, { difficultId: difficulties[mod(selectedIndex, difficultHolograms.length)].id })
		})

		this.container.addChild(difficultiesContainer)
	}
	async exit() {
		this.topText.text = `Let's Go!`
		await wait(500)
	}
}
