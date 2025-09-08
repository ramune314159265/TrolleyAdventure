import { Sound } from '@pixi/sound'

const bgmSets = {
	question: [
		'selector'
	]
}

export class BgmManager {
	static fadeoutMs = 1000
	constructor() {
		this.nowPlaying = null
	}
	playSet(id) {
		this.nowPlaying = Sound.from(bgmSets[id][Math.floor(Math.random() * bgmSets[id].length)])
		this.nowPlaying.play()
	}
}
