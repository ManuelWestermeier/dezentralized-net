import net from "net";
import getUserIPList from "./src/get-user-ip-list.js";
import { log } from "console";

const userList = await getUserIPList(["localhost", 22668]);

userList.forEach(log)