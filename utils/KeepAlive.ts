import http from "http";

export default ({ text, port }: { text?: string, port: number }) => {
    const portToUse = port || 3000;

    const server = http.createServer((_, res) => {
        res.writeHead(200);
        res.write("I'm up and running!\n");
        res.end(text || "I'm alive.");
    });
    console.log(`Listening on port ${portToUse}`);
    server.listen(portToUse);

    return server;
}