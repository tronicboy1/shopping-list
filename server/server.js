const http = require("http");

const server = http.createServer();

server.listen(4000, () => console.log("listening on 4000"));
