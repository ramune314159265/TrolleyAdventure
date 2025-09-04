import { Assets, Container, Sprite } from 'pixi.js'
import { Scene } from '.'
import { outputs } from '../../../enum'
import { easeOutQuint } from '../../../util/easing'
import { wait } from '../../../util/wait'
import { animateSimple } from '../animation'
import { BlinkText } from '../component/blinkText'
import { EffectContainer } from '../component/effectContainer'
import { FilledHologramContainer } from '../component/filledHologramContainer'
import { HologramContainer } from '../component/hologramContainer'
import { MainText } from '../component/mainText'
import { colors, constants } from '../constants'
import { TrolleyIO } from '../index'
import { BlackFaceTransition } from '../transition/blackFade'
import { QuestionScene } from './question'

export class DifficultSelectScene extends Scene {
	constructor({ difficulties }) {
		super()
		this.difficulties = difficulties
	}
	async init() {
		await Assets.loadBundle('difficult_select')

		this.background = Sprite.from('background')
		this.background.containerWidth = constants.viewWidth
		this.background.containerHeight = constants.viewHeight
		this.container.addChild(this.background)
		this.foreground = new EffectContainer()
		this.container.addChild(this.foreground)

		const topHologramInnerContainer = new Container()
		const topHologramWidth = constants.viewWidth * 0.7
		const topHologramHeight = 125
		this.topHologram = new FilledHologramContainer({
			maxWidth: topHologramWidth,
			maxHeight: topHologramHeight,
			color: colors.hologramMain,
			innerContainer: topHologramInnerContainer
		})
		this.topHologram.x = constants.viewWidth / 2
		this.topHologram.y = 108
		this.topHologram.show()
		this.topText = new BlinkText({
			content: '難易度を選んでください',
			styleOverride: {
				fontSize: 108
			}
		})
		this.topText.x = topHologramWidth / 2
		this.topText.y = topHologramHeight / 2
		topHologramInnerContainer.addChild(this.topText)
		this.foreground.addChild(this.topHologram)

		const hologramWidth = constants.viewWidth * 0.7
		const hologramHeight = constants.viewHeight - 350
		const gap = 200
		const difficultiesContainer = new Container()
		difficultiesContainer.x = constants.viewWidth / 2
		difficultiesContainer.y = 625
		const difficultList = Object.values(this.difficulties)
		this.difficultHolograms = difficultList.map((data, index) => {
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
			return hologram
		})
		this.foreground.addChild(difficultiesContainer)

		this.on(outputs.changeSelectingDifficult, ({ index, previousIndex }) => {
			this.difficultHolograms[previousIndex]?.scale?.set?.(1)
			animateSimple(rate => {
				this.difficultHolograms.forEach((hologram, i) => {
					index === i ? hologram.activate() : hologram.deactivate()
					const from = (hologramWidth + gap) * (i - previousIndex)
					const to = (hologramWidth + gap) * (i - index)
					hologram.x = from + (to - from) * rate
				})
				this.difficultHolograms[index]?.scale?.set?.(1 + 0.1 * rate)
			}, { easing: easeOutQuint, duration: 1000 })
		})
		this.once(outputs.selectedDifficult, ({ index }) => {
			this.difficultHolograms.forEach((h, i) => {
				if (index !== i) {
					h.hide()
				}
			})
			const transition = new BlackFaceTransition(TrolleyIO.instance.sceneManager.transitionLayerContainer)
			const questionScene = new QuestionScene()
			TrolleyIO.instance.sceneManager.changeScene(questionScene, transition)
		})
	}
	async exit() {
		this.topText.text = `Let's Go!`
		await wait(500)
		this.topHologram.destroy()
	}
}
