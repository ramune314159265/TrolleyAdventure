const leftElement = document.querySelector('.left')
const confirmElement = document.querySelector('.confirm')
const rightElement = document.querySelector('.right')

let rotation = 0
let ws = null
let pastInputStatus = {
	left: false,
	right: false,
	confirm: false
}

const inputChange = (key, newState) => {
	if (!ws) {
		return
	}
	switch (true) {
		case key === 'confirm' && newState:
			ws.send(JSON.stringify({
				event: 'confirm'
			}))
			break

		case (key === 'right' || key === 'left') && !newState:
			ws.send(JSON.stringify({
				event: 'center'
			}))
			break

		case key === 'right':
			ws.send(JSON.stringify({
				event: 'right'
			}))
			break

		case key === 'left':
			ws.send(JSON.stringify({
				event: 'left'
			}))
			break

		default:
			break
	}
}

document.querySelector('.buttons').addEventListener('pointerdown', e => {
	e.preventDefault()
	if (!(e.target instanceof HTMLButtonElement)) {
		return
	}
	e.target.isPressed = true
})
document.querySelector('.buttons').addEventListener('pointerup', e => {
	e.preventDefault()
	if (!(e.target instanceof HTMLButtonElement)) {
		return
	}
	e.target.isPressed = false
})
document.querySelector('.buttons').addEventListener('pointermove', () => {
	return false
})
document.querySelector('.buttons').addEventListener('pointercancel', e => {
	e.preventDefault()
	if (!(e.target instanceof HTMLButtonElement)) {
		return
	}
	e.target.isPressed = false
})

const loop = () => {
	const inputStatus = {
		right: 9 < rotation || rightElement.isPressed,
		left: rotation < -9 || leftElement.isPressed,
		confirm: confirmElement.isPressed,
	}
	Object.entries(inputStatus).forEach(([k, v]) => {
		if (pastInputStatus[k] !== v) {
			inputChange(k, v)
		}
	})
	pastInputStatus = inputStatus
}

setInterval(loop, 20)

const start = () => {
	navigator.wakeLock.request('screen')
	window.addEventListener('deviceorientation', e => {
		rotation = e.beta
	})
	const id = document.querySelector('#id').value
	const url = new URL(location.href)
	ws = new WebSocket(`${url.protocol === 'http:' ? 'ws' : 'wss'}://${url.host}/api/ws/${id}`)

	document.querySelector('.before').style.display = 'none'
	document.querySelector('.buttons').style.display = null
}

document.querySelector('.start').addEventListener('click', () => {
	if (DeviceOrientationEvent.requestPermission) {
		DeviceOrientationEvent.requestPermission()
			.then((permissionState) => {
				if (permissionState === "granted") {
					start()
				}
			})
			.catch(console.error)
	}
	start()
})

document.body.addEventListener('contextmenu', e => e.preventDefault())
