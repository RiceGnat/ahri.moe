const http = require("http");
const url = require("url");
const parse = require("csv-parse/lib/sync");
const $ = require("cheerio");

const host = "http://tappedout.net/mtg-decks/";
const printFlag = "fmt=printable";
const csvFlag = "fmt=csv";

var deck = {
    name: "",
    description: "",
    url: "",
    author: "",
    format: "",
    list : []
};

function GetInfo(target, res) {
    var path = host + target + "/?" + printFlag;

    var deckRequest = http.get(path, (deckResponse) => {
        if (deckResponse.statusCode == 200) {
            var responseString = "";
            deckResponse.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                var name = $("h2", responseString).first().text();
                deck.name = name.substr(1, name.length - 2);
                deck.description = $("p", responseString).first().text();
                deck.author = $("tr:contains(User) > td", responseString).last().text();
                deck.format = $("tr:contains(Format) > td", responseString).last().text();

                GetDeck(target, res);
            });
        }
        else {
            throw `Info request returned status code ${deckResponse.statusCode}`;
        }
    });
    deckRequest.end();
}

function GetDeck(target, res) {
    var path = host + target + "/?" + csvFlag;

    var deckRequest = http.get(path, (deckResponse) => {
        if (deckResponse.statusCode == 200) {
            var responseString = "";
            deckResponse.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                // This is a typo from tappedout.net
                responseString = responseString.replace("Languange", "Language");

                deck.list = parse(responseString, { columns: true });

                ReturnDeck(res);
            });
        }
        else {
            throw `Deck request returned status code ${deckResponse.statusCode}`;
        }
    });
    deckRequest.end();
}

function ReturnDeck(res) {
    res.writeHead(200, { "Content-Type": "text/json" });
    res.end(JSON.stringify(deck));
}

function LoadDeck(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1).replace(/\/$/, "");

    deck.url = host + targetName + "/";

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
            GetInfo(targetName, res);
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