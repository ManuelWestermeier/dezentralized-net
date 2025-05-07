const dgram = require('dgram');
const readline = require('readline');

const PEER_PORT = parseInt(process.argv[2]) || 10000;
const BOOTSTRAP_NODES = [
    { ip: '127.0.0.1', port: 10000 }, // add more known nodes here
];

const knownPeers = new Map(); // key: ip:port, value: {ip, port}
const socket = dgram.createSocket('udp4');

// Handle incoming messages
socket.on('message', (msg, rinfo) => {
    const data = msg.toString();
    const [cmd, payload] = data.split(':');

    const peerKey = `${rinfo.address}:${rinfo.port}`;
    if (!knownPeers.has(peerKey)) {
        knownPeers.set(peerKey, { ip: rinfo.address, port: rinfo.port });
    }

    if (cmd === 'HELLO') {
        console.log(`Received HELLO from ${peerKey}`);
        // Send our peer list back
        sendPeers(rinfo.address, rinfo.port);
    }

    if (cmd === 'PEERS') {
        const peers = payload.split(',');
        for (const peer of peers) {
            if (peer && peer !== `127.0.0.1:${PEER_PORT}` && !knownPeers.has(peer)) {
                const [ip, port] = peer.split(':');
                knownPeers.set(peer, { ip, port: parseInt(port) });
            }
        }
    }

    if (cmd === 'MSG') {
        console.log(`[Message] ${rinfo.address}:${rinfo.port} says: ${payload}`);
    }
});

function sendHello(ip, port) {
    const msg = Buffer.from(`HELLO:`);
    socket.send(msg, port, ip);
}

function sendPeers(ip, port) {
    const list = Array.from(knownPeers.keys()).join(',');
    const msg = Buffer.from(`PEERS:${list}`);
    socket.send(msg, port, ip);
}

function broadcastMessage(text) {
    const msg = Buffer.from(`MSG:${text}`);
    for (const { ip, port } of knownPeers.values()) {
        socket.send(msg, port, ip);
    }
}

// Start listening
socket.bind(PEER_PORT, () => {
    console.log(`Peer listening on port ${PEER_PORT}`);
    for (const peer of BOOTSTRAP_NODES) {
        if (peer.port !== PEER_PORT) {
            sendHello(peer.ip, peer.port);
        }
    }
});

// CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `You> `
});

rl.prompt();
rl.on('line', line => {
    broadcastMessage(line.trim());
    rl.prompt();
});
