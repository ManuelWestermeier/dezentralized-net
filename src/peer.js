const dgram = require('dgram');
const net = require('net');
const readline = require('readline');

const CENTRAL_SERVER = { host: '127.0.0.1', port: 9000 };

const PEER_ID = process.argv[2];
const UDP_PORT = parseInt(process.argv[3]);

if (!PEER_ID || !UDP_PORT) {
    console.error('Usage: node peer.js <id> <udp_port>');
    process.exit(1);
}

// UDP socket for messages
const udpSocket = dgram.createSocket('udp4');

udpSocket.on('message', (msg, rinfo) => {
    console.log(`[UDP] From ${rinfo.address}:${rinfo.port}: ${msg.toString()}`);
});

udpSocket.bind(UDP_PORT, () => {
    const ip = udpSocket.address().address;
    register(ip);
});

// Register to central server
function register(ip) {
    const client = net.createConnection(CENTRAL_SERVER, () => {
        client.write(`REGISTER ${PEER_ID} ${ip} ${UDP_PORT}\n`);
    });
    client.on('data', data => {
        console.log(`[Central] ${data.toString().trim()}`);
        client.end();
    });
}

function unregister() {
    const client = net.createConnection(CENTRAL_SERVER, () => {
        client.write(`UNREGISTER ${PEER_ID}\n`);
    });
    client.on('data', data => {
        console.log(`[Central] ${data.toString().trim()}`);
        client.end();
        process.exit(0);
    });
}

function getPeer(targetId, callback) {
    const client = net.createConnection(CENTRAL_SERVER, () => {
        client.write(`GET ${PEER_ID} ${targetId}\n`);
    });
    client.on('data', data => {
        const resp = data.toString().trim();
        client.end();
        if (resp === 'NOT_FOUND') {
            console.log('Peer not found.');
        } else {
            const [ip, port] = resp.split(' ');
            callback(ip, parseInt(port));
        }
    });
}

// CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${PEER_ID}> `
});

rl.prompt();
rl.on('line', line => {
    const [cmd, arg1, ...rest] = line.trim().split(' ');
    if (cmd === 'exit') {
        unregister();
    } else if (cmd === 'send' && arg1 && rest.length > 0) {
        const message = rest.join(' ');
        getPeer(arg1, (ip, port) => {
            udpSocket.send(message, port, ip);
        });
    } else {
        console.log('Commands: send <peerId> <message>, exit');
    }
    rl.prompt();
});
