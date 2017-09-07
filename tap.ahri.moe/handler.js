const http = require("http");
const url = require("url");
const parse = require('csv-parse/lib/sync');

const host = "http://tappedout.net/mtg-decks/";
const csvFlag = "fmt=csv";

var deck;

function ExtractTitle(htmlString) {
    return $(".well-jumbotron h2", htmlString).text().trim();
}

function LoadDeck(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1).replace(/\/$/, "");
    var path = host + targetName + "/?" + csvFlag;

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
                    var responseString = "";
                    deckResponse.on("data", (chunk) => {
                        responseString += chunk;
                    }).on("end", () => {
                        // This is a typo from tappedout.net
                        responseString = responseString.replace("Languange", "Language");

                        deck = parse(responseString, { columns: true });

                        res.writeHead(200, { "Content-Type": "text/json" });
                        res.end(JSON.stringify(deck));
                    });
                }
                else {
                    throw `Deck request returned status code ${deckResponse.statusCode}`;
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