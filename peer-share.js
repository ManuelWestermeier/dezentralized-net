import net from "net";

const users = new Set();

net.createServer((socket) => {
    const id = `${socket.remoteAddress}:${socket.remotePort}`;
    users.add(id);

    socket.write(JSON.stringify([...users]));

    socket.on("end", () => {
        users.delete(id);
    });
}).listen(22668, () => {
    console.log("Server listening on port 22668");
});