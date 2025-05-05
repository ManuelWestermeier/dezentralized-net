import net from "net";

const users = new Map();

net.createServer((socket) => {
    console.log(socket.localAddress);

    socket.on("data", data => {

        // const out = JSON.parse(data.toString("utf-8"));

        // if (out.fn == "") {

        // }
    });
}).listen(22_668);