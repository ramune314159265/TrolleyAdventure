const yourNumberElement = document.querySelector('.yourNumber')
const waitingNumberElement = document.querySelector('.waitingNumber')
const estimatedTimeElement = document.querySelector('.estimatedTime')

const url = new URL(location.href)
const yourNumber = parseInt(Object.fromEntries(url.searchParams.entries()).n)

yourNumberElement.innerText = `(${yourNumber}番)`

const waitingUpdate = (callingNumber) => {
	if (Number.isNaN(yourNumber)) {
		document.querySelector('.yourNumber').style.display = 'none'
		document.querySelector('.waitingNumberWrapper h2').innerText = '現在の番号'
		document.querySelector('.waitingNumberWrapper .unit').innerText = '番'
		document.querySelector('.estimatedTimeWrapper h2').style.display = 'none'
		return
	}
	const waitingNumber = Math.max(yourNumber - callingNumber, 0)
	waitingNumberElement.innerText = waitingNumber
	waitingNumberElement.style.color = waitingNumber === 0 ? 'green' : 'red'
	switch (true) {
		case waitingNumber === 0:
			estimatedTimeElement.innerText = '0分'
			break
		case 0 < waitingNumber && waitingNumber <= 5:
			estimatedTimeElement.innerText = '~5分'
			break
		case 5 < waitingNumber && waitingNumber <= 10:
			estimatedTimeElement.innerText = '~15分'
			break
		case 10 < waitingNumber && waitingNumber <= 20:
			estimatedTimeElement.innerText = '~30分'
			break
		case 20 < waitingNumber && waitingNumber <= 30:
			estimatedTimeElement.innerText = '~50分'
			break
		case 30 < waitingNumber && waitingNumber <= 60:
			estimatedTimeElement.innerText = '~100分'
			break
		case 60 < waitingNumber:
			estimatedTimeElement.innerText = '2時間~'
			break
	}
}

const getQueue = async () => {
	return (await (await fetch('/api/queue/')).json()).queue
}
waitingUpdate(await getQueue())

const connectWs = () => {
	const ws = new WebSocket('/api/queue/ws/')
	ws.onmessage = (message) => {
		const data = JSON.parse(message.data)
		if (data.message !== 'queue_update') {
			return
		}
		waitingUpdate(data.queue)
	}
	ws.onerror = () => {
		setTimeout(async () => {
			waitingUpdate(await getQueue())
			connectWs()
		}, 2000)
	}
	ws.onclose = () => {
		setTimeout(async () => {
			waitingUpdate(await getQueue())
			connectWs()
		}, 3000)
	}
}
connectWs()
