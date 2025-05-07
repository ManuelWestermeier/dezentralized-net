const net = require('net');

const PORT = 9000;
const peers = new Map(); // id -> { ip, port }

const server = net.createServer(socket => {
    socket.on('data', data => {
        const msg = data.toString().trim();
        const parts = msg.split(' ');
        const cmd = parts[0];
        const id = parts[1];

        if (cmd === 'REGISTER' && parts.length === 4) {
            const ip = parts[2];
            const port = parseInt(parts[3]);
            peers.set(id, { ip, port });
            socket.write('OK\n');
        } else if (cmd === 'UNREGISTER') {
            peers.delete(id);
            socket.write('OK\n');
        } else if (cmd === 'GET' && parts.length === 3) {
            const targetId = parts[2];
            const target = peers.get(targetId);
            if (target) {
                socket.write(`${target.ip} ${target.port}\n`);
            } else {
                socket.write('NOT_FOUND\n');
            }
        } else {
            socket.write('ERROR\n');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Central server listening on TCP port ${PORT}`);
});
