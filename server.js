var http = require("http");
var url = require("url");
var fs = require("fs");

http.createServer(function (req, res) {
    var vhost;
    if ('host' in req.headers) {
        vhost = req.headers['host'].split(':')[0];
    } else {
        vhost = null;
    }

    try {
        var handler = require("./" + vhost + "/handler.js");
        handler.handle(req, res);
    }
    catch (ex) {
        res.writeHead(501, { "Content-Type": "text/plain" });
        res.end("Not Implemented");
    }
}).listen(8080);