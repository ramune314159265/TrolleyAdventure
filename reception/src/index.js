const queueInputElement = document.querySelector('input.queueNumber')
const queueNextElement = document.querySelector('button.queueNext')

const syncQueueNumber = queue => {
	queueInputElement.value = queue
}
const changeQueueNumber = newValue => {
	fetch('/api/queue/update/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ number: newValue })
	})
}

const getQueue = async () => {
	return (await (await fetch('/api/queue/')).json()).queue
}
syncQueueNumber(await getQueue())

const connectQueueWs = () => {
	const ws = new WebSocket('/api/queue/ws/')
	ws.onmessage = (message) => {
		const data = JSON.parse(message.data)
		if (data.message !== 'queue_update') {
			return
		}
		syncQueueNumber(data.queue)
	}
	ws.onerror = () => {
		setTimeout(async () => {
			syncQueueNumber(await getQueue())
			connectQueueWs()
		}, 2000)
	}
	ws.onclose = () => {
		setTimeout(async () => {
			syncQueueNumber(await getQueue())
			connectQueueWs()
		}, 3000)
	}
}
connectQueueWs()

queueInputElement.addEventListener('change', e => {
	changeQueueNumber(e.target.value)
})
queueNextElement.addEventListener('click', () => {
	changeQueueNumber(parseInt(queueInputElement.value) + 1)
})

const states = {
	waitingStage: '使用中',
	gameClear: '空き',
	gameOver: '空き',
}

const wsChannels = await(await fetch('/api/ws/')).json()
wsChannels.sort((a, b) => a.id.localeCompare(b.id)).forEach(c => {
	let ws = null
	const fragment = document.createElement('div')
	const template = document.getElementById('channelTemplate').content.cloneNode(true)
	fragment.append(template)
	document.querySelector('.status').append(fragment)
	fragment.querySelector('.id').innerText = c.id
	fragment.querySelector('.reload').addEventListener('click', () => {
		ws.send(JSON.stringify({
			event: 'reload',
			data: {}
		}))
	})

	const connectChannelWs = () => {
		ws = new WebSocket(`/api/ws/${c.id}`)
		ws.onmessage = (message) => {
			const data = JSON.parse(message.data)
			if (!Object.hasOwn(states, data.event)) {
				return
			}
			fragment.querySelector('.status').innerText = states[data.event]
		}
		ws.onerror = () => {
			setTimeout(async () => {
				syncQueueNumber(await getQueue())
				connectChannelWs()
			}, 2000)
		}
		ws.onclose = () => {
			setTimeout(async () => {
				syncQueueNumber(await getQueue())
				connectChannelWs()
			}, 3000)
		}
	}
	connectChannelWs()
})
