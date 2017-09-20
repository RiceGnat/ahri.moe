var http = require("http");
var url = require("url");

http.createServer(function (req, res) {
    var vhost;
    if ('host' in req.headers) {
        vhost = req.headers['host'].split(':')[0];
    } else {
        vhost = null;
    }

    if (vhost.toLowerCase() == "localhost") {
        vhost = process.argv[2];
    }

    try {
        var handler = require("./" + vhost + "/handler.js");
        handler.handle(req, res);
    }
    catch (ex) {
        console.log("[" + new Date().toJSON().substring(11, 19) + "] " + ex);
        res.writeHead(501, {
            "Content-Type": "text/plain"
        });
        res.end("Not Implemented");
    }
}).listen(process.env.PORT || 8080);
