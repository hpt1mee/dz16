import fs from 'fs'
import http from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'

const PORT = 3000
const visitsF = path.join(process.cwd(), 'visits.txt')

const server = http.createServer((req, res) => {
	const url = req.url

	if (url === '/' || url === '/page1') {
		servePage(res, 'page1.html', 'text/html')
		incrementVisits()
	} else if (url === '/page2') {
		servePage(res, 'page2.html', 'text/html')
	} else if (url === '/page3') {
		servePage(res, 'page3.html', 'text/html')
	} else if (url === '/page4') {
		servePage(res, 'page4.json', 'application/json')
	} else if (url === '/page5') {
		getVisits(visits => {
			const content = `Количество посещений: ${visits}`

			res.writeHead(200, { 'Content-Type': 'text/plain' })
			res.end(content)
		})
	} else if (url === '/css/favicon.ico') {
		serveFavicon(res)
	} else if (url === '/css/styles.css') {
		serveCSS(res)
	} else if (url === '/js/script.js') {
		serveJS(res)
	} else {
		serve404(res)
	}
})

const wss = new WebSocketServer({ server })

wss.on('connection', ws => {
	const interval = setInterval(() => {
		const time = new Date().toLocaleTimeString()
		ws.send(JSON.stringify({ time }))
	}, 1000)

	ws.on('close', () => {
		clearInterval(interval)
	})
})

function servePage(res, page, contentType) {
	const filePath = path.join(process.cwd(), 'pages', page)
	fs.readFile(filePath, (err, data) => {
		if (err) {
			serve404(res)
			return
		}
		res.writeHead(200, { 'Content-Type': contentType })
		res.end(data)
	})
}

function serveFavicon(res) {
	const filePath = path.join(process.cwd(), 'public', 'css', 'favicon.ico')
	fs.readFile(filePath, (err, data) => {
		if (err) {
			serve404(res)
			return
		}
		res.writeHead(200, { 'Content-Type': 'image/x-icon' })
		res.end(data)
	})
}

function serveCSS(res) {
	const filePath = path.join(process.cwd(), 'public', 'css', 'style.css')
	fs.readFile(filePath, (err, data) => {
		if (err) {
			serve404(res)
			return
		}
		res.writeHead(200, { 'Content-Type': 'text/css' })
		res.end(data)
	})
}

function serveJS(res) {
	const filePath = path.join(process.cwd(), 'public', 'js', 'script.js')
	fs.readFile(filePath, (err, data) => {
		if (err) {
			serve404(res)
			return
		}
		res.writeHead(200, { 'Content-Type': 'application/javascript' })
		res.end(data)
	})
}

function serve404(res) {
	res.writeHead(404, { 'Content-Type': 'text/plain' })
	res.end('404 Not Found')
}

function incrementVisits() {
	fs.readFile(visitsF, 'utf8', (err, data) => {
		let visits = parseInt(data) || 0
		visits++
		fs.writeFile(visitsF, visits.toString(), err => {
			if (err) throw err
		})
	})
}

function getVisits(callback) {
	fs.readFile(visitsF, 'utf8', (err, data) => {
		if (err) {
			callback(0)
		} else {
			callback(parseInt(data) || 0)
		}
	})
}

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

