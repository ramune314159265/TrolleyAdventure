import { animateSimple } from './animation'

const seList = {
	'hologram': {
		path: './sounds/se/hologram.mp3',
		volume: 0.5
	}, 'question_show': {
		path: './sounds/se/question_show.mp3',
		volume: 0.7
	}, 'ssh_start': {
		path: './sounds/se/ssh_start.mp3',
		volume: 0.4
	}, 'ssh_end': {
		path: './sounds/se/ssh_start.mp3',
		volume: 0.7,
		start: 6.5
	}, 'question_caution': {
		path: './sounds/se/question_caution.mp3',
		volume: 0.7
	}, 'question_caution_critical': {
		path: './sounds/se/question_caution_critical.mp3',
		volume: 0.2
	}, 'decided': {
		path: './sounds/se/question_show.mp3',
		volume: 0.5
	}, 'selected': {
		path: './sounds/se/selected.mp3',
		volume: 0.5
	}, 'is_correct': {
		path: './sounds/se/is_correct.mp3',
		volume: 1
	}, 'correct': {
		path: './sounds/se/correct.mp3',
		volume: 1
	}, 'incorrect': {
		path: './sounds/se/incorrect.mp3',
		volume: 1
	}, 'countdown': {
		path: './sounds/se/countdown.mp3',
		volume: 0.7
	}, 'noise': {
		path: './sounds/se/noise.mp3',
		volume: 1
	}, 'ssh_turn': {
		path: './sounds/se/ssh_turn.mp3',
		volume: 0.3
	}
}

export class SeManager {
	static fadeoutMs = 500
	constructor() {
		this.audios = {}
	}
	play(id) {
		const data = seList[id]
		const uuid = crypto.randomUUID()
		this.audios = {
			[uuid]: {
				audio: new Audio(data.path),
				...data
			},
			...this.audios
		}
		this.audios[uuid].audio.volume = data.volume
		this.audios[uuid].audio.currentTime = data.currentTime ?? 0
		this.audios[uuid].audio.play()
		return uuid
	}
	async stop(uuid) {
		if (!this.audios[uuid]) {
			return
		}
		await animateSimple(rate => {
			this.audios[uuid].audio.volume = this.audios[uuid].volume * (1 - rate)
		}, { easing: r => r, duration: SeManager.fadeoutMs })
		this.audios[uuid].audio.pause()
	}
}
