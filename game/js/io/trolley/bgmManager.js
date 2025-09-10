import { randomFromArray, shuffleArray } from '../../util/random'
import { animateSimple } from './animation'

const bgmSets = {
	question: [
		'./sounds/bgm/electric_river.mp3',
		'./sounds/bgm/experimenta_model.mp3',
		'./sounds/bgm/leviathan.mp3',
		'./sounds/bgm/selector.mp3',
	]
}

export class BgmManager {
	static fadeoutMs = 3000
	static volume = 0.1
	constructor() {
		this.nowPlaying = null
		this.eventListener = () => { }
	}
	async playSet(setId) {
		const url = randomFromArray(bgmSets[setId])
		await this.play(url)
	}
	async play(url) {
		this.nowPlaying = new Audio(url)
		this.nowPlaying.volume = BgmManager.volume
		await this.nowPlaying.play()
		await new Promise(resolve => {
			this.eventListener = async () => {
				if ((this.nowPlaying.duration - BgmManager.fadeoutMs / 1000) < this.nowPlaying.currentTime) {
					await this.stop()
					resolve()
				}
			}
			this.nowPlaying.addEventListener('timeupdate', this.eventListener)
		})
	}
	async playSetLoop(setId) {
		const sets = shuffleArray(bgmSets[setId])
		for (const url of sets) {
			await this.play(url)
		}
		this.playSetLoop(setId)
	}
	async stop() {
		if (!this.nowPlaying) {
			return
		}
		this.nowPlaying.removeEventListener('timeupdate', this.eventListener)
		await animateSimple(rate => {
			this.nowPlaying.volume = BgmManager.volume * (1 - rate)
		}, { easing: r => r, duration: BgmManager.fadeoutMs })
		this.nowPlaying.pause()
	}
}
