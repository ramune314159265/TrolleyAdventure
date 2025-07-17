import { TrolleyIO } from '.'

export const animateSimple = (callback, { easing, duration }) => {
	return new Promise(resolve => {
		const startMs = performance.now()
		const handle = () => {
			const elapsed = performance.now() - startMs
			const rate = elapsed / duration
			if (1 < rate) {
				TrolleyIO.instance.app.ticker.remove(handle)
				resolve()
			}
			callback(easing(rate))
		}
		TrolleyIO.instance.app.ticker.add(handle)
	})
}
