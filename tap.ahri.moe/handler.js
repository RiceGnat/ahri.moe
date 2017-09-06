var http = require("http");
var url = require("url");
var $ = require("cheerio");

var host = "http://tappedout.net/mtg-decks/";

function LoadDeck(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1);
    var path = host + targetName + "/";

    try {
        if (targetName == "favicon.ico") {
            // Ignore favicon requests
            res.writeHead(204);
            res.end();
        }
        else if (targetName == "") {
            res.writeHead(200);
            res.end();
        }
        else {
            var deckRequest = http.request(path, (deckResponse) => {
                if (deckResponse.statusCode == 200) {
                    var pageString = "";
                    deckResponse.on("data", (chunk) => {
                        pageString += chunk;
                    }).on("end", () => {
                        res.writeHead(200);
                        res.write(pageString);
                        res.end();
                    });
                }
                else {
                    res.writeHead(deckResponse.statusCode);
                    res.end();
                }
            });
            deckRequest.end();
        }
    }
    catch (ex) {
        console.log("[" + new Date().toJSON().substring(11, 19) + "] " + ex);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
}

module.exports = {
    handle: LoadDeck
}