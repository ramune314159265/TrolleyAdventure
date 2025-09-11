import { Assets, Container, Graphics } from 'pixi.js'
import { Scene } from '.'
import { TrolleyIO } from '..'
import { inputs, outputs } from '../../../enum'
import { wait } from '../../../util/wait'
import { AvailableControls } from '../component/availableControl'
import { EffectContainer } from '../component/effectContainer'
import { FilledHologramContainer } from '../component/filledHologramContainer'
import { FitSprite } from '../component/fitSprite'
import { HologramContainer } from '../component/hologramContainer'
import { MainText } from '../component/mainText'
import { VideoBackground } from '../component/videoBackground'
import { colors, constants } from '../constants'

export class GameClearScene extends Scene {
	constructor({ correctContent, incorrectContent, imageUrl }) {
		super()
		this.correctContent = correctContent
		this.incorrectContent = incorrectContent
		this.imageUrl = imageUrl
	}
	async init() {
		await Assets.loadBundle('clear')

		this.background = new VideoBackground({ width: constants.width, height: constants.height })
		this.changePromise = this.background.changeVideo(['ssh_goal', 'ssh_goal_static'])
		this.container.addChild(this.background)
		this.foreground = new EffectContainer()
		this.container.addChild(this.foreground)
		this.availableControls = new AvailableControls()
		this.foreground.addChild(this.availableControls)

		this.endSe = TrolleyIO.instance.seManager.play('ssh_end')
	}
	async enter() {
		await this.changePromise
		TrolleyIO.instance.seManager.stop(this.endSe)
		await wait(500)

		const filledHologramWidth = constants.viewWidth * 0.9
		const filledHologramHeight = 125
		const hologramContainer = new Container()
		const hologramText = new MainText({
			content: 'ミッションクリア！',
			styleOverride: {
				fontSize: 120,
			}
		})
		hologramText.x = filledHologramWidth / 2
		hologramText.y = filledHologramHeight / 2
		hologramContainer.addChild(hologramText)
		const hologram = new FilledHologramContainer({
			maxWidth: filledHologramWidth,
			maxHeight: filledHologramHeight,
			color: colors.primary.main,
			innerContainer: hologramContainer
		})
		hologram.x = constants.viewWidth / 2
		hologram.y = constants.viewHeight / 2
		this.foreground.addChild(hologram)
		await hologram.show()
		await wait(3000)
		await hologram.hide()

		const hologramWidth = 750
		const hologramHeight = 650
		const bottomContainer = new Container()
		bottomContainer.x = constants.viewWidth / 2
		bottomContainer.y = 600
		this.foreground.addChild(bottomContainer)
		const explanationInnerContainer = new Container()
		const explanationHologram = new HologramContainer({
			maxWidth: hologramWidth,
			maxHeight: hologramHeight,
			color: colors.primary.main,
			innerContainer: explanationInnerContainer,
		})
		explanationHologram.x = -constants.viewWidth / 4
		bottomContainer.addChild(explanationHologram)
		const explainContent = [
			this.correctContent,
			this.incorrectContent
		].filter(c => c).join('\n')
		const explanationText = new MainText({
			content: explainContent,
			styleOverride: {
				fontSize: 72,
				wordWrap: true,
				wordWrapWidth: hologramWidth,
				breakWords: true,
			}
		})
		explanationText.anchor = { x: 0.5, y: 0 }
		explanationText.x = hologramWidth / 2
		explanationText.y = 0
		explanationInnerContainer.addChild(explanationText)
		hologramText.text = '解説'
		hologram.y = 180
		hologram.show()
		explanationHologram.show()
		if (this.imageUrl) {
			const texture = await Assets.load(`images/question/${this.imageUrl}`)
			const image = new FitSprite({ texture, width: hologramWidth, height: hologramHeight })
			image.x = constants.viewWidth / 4
			bottomContainer.addChild(image)
		} else {
			const backgroundGraphics = new Graphics()
			backgroundGraphics.rect(-hologramWidth / 2, -hologramHeight / 2, hologramWidth, hologramHeight)
			backgroundGraphics.x = constants.viewWidth / 4
			backgroundGraphics.fill({ color: `${colors.gray.main}a0` })
			bottomContainer.addChild(backgroundGraphics)
			const noImageText = new MainText({
				content: 'No Image',
				styleOverride: {
					fontSize: 108,
					fill: '#ffffff'
				}
			})
			noImageText.x = constants.viewWidth / 4
			bottomContainer.addChild(noImageText)
		}
		this.on(outputs.changeAvailableControls, ({ controls }) => {
			this.availableControls.setControls({ controls })
			this.availableControls.x = constants.viewWidth - this.availableControls.width - 96
			this.availableControls.y = constants.viewHeight - this.availableControls.height - 16
		})
		this.emit(inputs.next)
	}
}
