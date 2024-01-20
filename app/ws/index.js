const net = require('net');
// 建立 Server 端与 Client 端连接
const server = net.createServer(socket => {
    console.log("请求代理")
    socket.write(`Tunnel-Subdoman: test`);
});

server.listen(9999, () => {
    console.log('start server');
});