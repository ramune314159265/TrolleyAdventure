import { Assets, Container, Sprite } from '../../../libraries/pixi.min.mjs'
import { blinkText } from '../component/blinkText.js'
import { mainText } from '../component/mainText.js'
import { constants } from '../constants.js'

export class DifficultSelectScene {
	#io
	constructor({ io }) {
		this.#io = io
		this.container = new Container()
		this.init()
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

		const mapTexture = await Assets.load('map')
		const mapsContainer = new Container()
		mapsContainer.x = constants.viewWidth / 2
		mapsContainer.y = 425
		const mapPositions = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
		mapPositions.forEach((p, i) => {
			const mapContainer = new Container()
			mapContainer.x = (constants.viewWidth / 4) * p[0]
			mapContainer.y = 150 * p[1]
			mapsContainer.addChild(mapContainer)
			const map = new Sprite(mapTexture)
			map.width = 600
			map.height = 270
			map.anchor.x = 0.5
			map.anchor.y = 0.5
			map.x = 0
			map.y = 0
			mapContainer.addChild(map)
			const difficultName = mainText({
				content: Object.values(this.#io.sentData.difficultList)[i].name,
				styleOverride: {
					fontSize: 52,
				}
			})
			difficultName.anchor.y = 0
			difficultName.y = -125
			mapContainer.addChild(difficultName)
			const difficultDescription = mainText({
				content: Object.values(this.#io.sentData.difficultList)[i].description,
				styleOverride: {
					lineHeight: 44
				}
			})
			difficultDescription.anchor.y = 0
			difficultDescription.y = -40
			mapContainer.addChild(difficultDescription)
		})
		this.container.addChild(mapsContainer)
	}
}
