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

const loop = () => {
	const inputStatus = {
		right: 9 < rotation,
		left: rotation < -9,
	}
	Object.entries(inputStatus).forEach(([k, v]) => {
		if (pastInputStatus[k] !== v) {
			inputChange(k, v)
		}
	})
	pastInputStatus = inputStatus
}

setInterval(loop, 50)

const start = () => {
	window.addEventListener('deviceorientation', e => {
		rotation = e.beta
	})
	const id = document.querySelector('#id').value
	const url = new URL(location.href)
	ws = new WebSocket(`${url.protocol === 'http:' ? 'ws' : 'wss'}://${url.host}/api/ws/${id}`)
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
