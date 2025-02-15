alert(1)
document.getElementById('time').textContent = new Date().toLocaleTimeString()
const ws = new WebSocket('ws://localhost:3000')

ws.onmessage = event => {
	const data = JSON.parse(event.data)
	document.getElementById('time').textContent = data.time
}
