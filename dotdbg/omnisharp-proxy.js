const net = require('net');

const server = net.createServer(socket => {
  const client = new net.Socket();
  client.connect(1234, '127.0.0.1', () => {
    socket.pipe(process.stdout);
    socket.pipe(client);
    client.pipe(process.stdout);
    client.pipe(socket);
  });
});


server.listen(1235, '127.0.0.1');
