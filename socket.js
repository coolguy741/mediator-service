/** @format */

const io = require("socket.io")();
const socketioJwt = require("socketio-jwt");

const socket = {
  io: io,
};
io.use(
  socketioJwt.authorize({
    secret: process.env.SECRET_KEY,
    handshake: true,
  }),
);
io.on("connection", (socket) => {
  console.log("hello!", socket.decoded_token);
  socket.on("test", (from) => {
    console.log(from);
    socket.emit("test", { from: "server" });
  });
});

module.exports = socket;
