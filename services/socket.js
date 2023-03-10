/** @format */
const server = require('http').createServer()
const io = require('socket.io')(server, {
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
})
const socketioJwt = require('socketio-jwt')
const web_app = require('../app')
const SocketHelper = require('../helper/SocketHelper')

const socket = {
  io: io,
}
io.use(
  socketioJwt.authorize({
    secret: process.env.SECRET_KEY,
    handshake: true,
  })
)
io.on('connection', async (socket) => {
  try {
    console.log('====Connect Socket')
    let browser_srv = web_app.get('browser-service')

    let user = socket.decoded_token
    let browser = browser_srv.getBrowser(user.identifier)
    if (browser) {
      await browser.setSocket(socket)
      const socketHelper = new SocketHelper(socket)
      socketHelper.sendMessage('socket-connection', {connection: true})
    } else {
      console.log('Browser is not exists')
    }
  } catch (error) {
    console.error('socket connecting error', error)
  }
})

module.exports = socket
