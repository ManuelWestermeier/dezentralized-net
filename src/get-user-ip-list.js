import net from "net";

/**
 * 
 * @param {*} param0 
 * @returns {Array<string>}
 */
export default function getUserIPList([host, port]) {
    const conn = net.createConnection({ port, host });

    return new Promise((res) => {
        let data = "";

        conn.on("data", _data => {
            data += _data.toString("utf-8");

            try {
                res(JSON.parse(data));
            } catch (_) { }
        });
    });
}