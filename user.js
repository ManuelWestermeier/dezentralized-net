import net from "net";
import getUserIPList from "./src/get-user-ip-list.js";

const userList = await getUserIPList(["localhost", 22668]);

const connectChunk = Math.min(20, Math.floor(userList / 2));
const connectIPS = userList.slice(
    Math.floor(connectChunk * Math.random()), connectChunk
).map(ipStr => ipStr.split(":").map(parseInt));

for (const ip of connectIPS) {

}