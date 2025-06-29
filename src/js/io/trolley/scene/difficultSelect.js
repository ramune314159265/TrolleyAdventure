import { Assets, Container, Sprite, Text } from '../../../libraries/pixi.min.mjs'
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

		const topText = new Text('難易度を選んでください', {
			fontSize: 72,
			fontFamily: 'Main',
			fill: {
				color: '#ffffff'
			},
			stroke: {
				width: 8,
				color: '#000000'
			},
			dropShadow: {
				color: '#000000',
				distance: 6,
				angle: Math.PI / 4
			},
		})
		topText.anchor.x = 0.5
		topText.anchor.y = 0.5
		topText.x = constants.viewWidth / 2
		topText.y = 72
		const animationStart = performance.now()
		const topTextTicker = () => {
			topText.alpha = Math.abs(Math.sin((performance.now() - animationStart) / 1000))
		}
		this.#io.app.ticker.add(topTextTicker)
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
			const difficultName = new Text(Object.values(this.#io.sentData.difficultList)[i].name, {
				fontSize: 52,
				fontFamily: 'Main',
				fill: {
					color: '#ffffff'
				},
				stroke: {
					width: 8,
					color: '#000000'
				},
				dropShadow: {
					color: '#000000',
					distance: 6,
					angle: Math.PI / 4
				},
			})
			difficultName.anchor.x = 0.5
			difficultName.y = -110
			mapContainer.addChild(difficultName)
			const difficultDescription = new Text(Object.values(this.#io.sentData.difficultList)[i].description, {
				fontSize: 36,
				fontFamily: 'Main',
				lineHeight: 44,
				fill: {
					color: '#ffffff'
				},
				stroke: {
					width: 8,
					color: '#000000'
				},
				dropShadow: {
					color: '#000000',
					distance: 6,
					angle: Math.PI / 4
				},
			})
			difficultDescription.anchor.x = 0.5
			difficultDescription.y = -40
			mapContainer.addChild(difficultDescription)
		})
		this.container.addChild(mapsContainer)
	}
}
