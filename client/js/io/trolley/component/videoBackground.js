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
				this.sprite.texture.source.resource.addEventListener('ended', async () => {
					resolve()
				}, { once: true })
			})
		}
		const { promise, resolve } = Promise.withResolvers()
		const [video, ...nextVideos] = videos
		this.removeChild(this.sprite)
		this.sprite = Sprite.from(video)
		this.sprite.containerWidth = this.containerWidth
		this.sprite.containerHeight = this.containerHeight
		this.sprite.texture.source.resource.currentTime = 0
		this.sprite.texture.source.resource.play()
		if (nextVideos.length === 0) {
			this.sprite.texture.source.resource.loop = true
		} else {
			this.sprite.texture.source.resource.addEventListener('ended', async () => {
				await this.changeVideo(nextVideos)
				resolve()
			}, { once: true })
		}
		this.addChild(this.sprite)
		return promise
	}
}
