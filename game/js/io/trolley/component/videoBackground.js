import { Container, Sprite } from 'pixi.js'

export class VideoBackground extends Container {
	constructor({ width, height }) {
		super()
		this.containerWidth = width
		this.containerHeight = height
		this.sprite = new Sprite()
	}
	async changeVideo(videos) {
		if (this.sprite.texture?.source?.resource) {
			this.sprite.texture.source.resource.loop = false
			await new Promise((resolve) => {
				this.sprite.texture.source.resource.addEventListener('ended', () => {
					console.log()
					resolve()
				}, { once: true })
			})
		}
		const [video, ...nextVideos] = videos
		this.removeChild(this.sprite)
		this.sprite = Sprite.from(video)
		this.sprite.containerWidth = this.containerWidth
		this.sprite.containerHeight = this.containerHeight
		this.sprite.texture.source.resource.currentTime = 0
		this.sprite.texture.source.resource.play()
		this.addChild(this.sprite)
		if (nextVideos.length === 0) {
			this.sprite.texture.source.resource.loop = true
		} else {
			await this.changeVideo(nextVideos)
		}
	}
}
