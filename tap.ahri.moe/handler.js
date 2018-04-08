const http = require("http");
const url = require("url");
const fs = require("fs");
const parse = require("csv-parse/lib/sync");
const $ = require("cheerio");

const mtgimg = require("./mtg-imgs.js");
const mtgora = require("./mtg-oracle.js");

const host = "tapped-out-proxy.herokuapp.com";
const hostDeckPath = "/mtg-decks/";
const hostUserPath = "/users/"
const printFlag = "fmt=printable";
const csvFlag = "fmt=csv";
const requestHeaders = {
    "Cache-Control": "no-cache",
};

function GetInfo(deck, target, res) {
    var deckRequest = http.get({
        hostname: host,
        path: hostDeckPath + deck.slug + "/?" + printFlag,
        headers: requestHeaders
    }, (deckResponse) => {
        if (deckResponse.statusCode == 200) {
            var responseString = "";
            deckResponse.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                var name = $("h2", responseString).first().text();
                deck.name = name.substr(1, name.length - 2);
                deck.description = $("p", responseString).first().text();
                deck.author = $("tr:contains(User) > td", responseString).last().text();
                deck.userpage = host + hostUserPath + deck.author;
                deck.format = $("tr:contains(Format) > td", responseString).last().text();
                deck.count = $("tr:contains(Cards) > td", responseString).last().text();

                if (deck.format.includes("Commander")) {
                    deck.commander = [];
                    $("h2.snug:contains(Commander)", responseString).parent().contents().each(function (index, element) {
                        if (element.nodeType == 3) {
                            var match = $(element).text().match(/\d+x\s*(.+)/)
                            if (match) deck.commander.push(match[1]);
                        }
                    });
                }

                GetCards(deck, target, res);
            });
        }
        else {
            ReturnError(res, `Info request returned status code ${deckResponse.statusCode}\n${JSON.stringify(deckResponse.headers)}`);
        }
    });
    deckRequest.end();
}

function GetCards(deck, target, res) {
    var deckRequest = http.get({
        hostname: host,
        path: hostDeckPath + deck.slug + "/?" + csvFlag,
        headers: requestHeaders
    }, (deckResponse) => {
        if (deckResponse.statusCode == 200) {
            var responseString = "";
            deckResponse.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                // This is a typo from tappedout.net
                responseString = responseString.replace("Languange", "Language");

                deck.list = parse(responseString, { columns: true });

                SanitizeDeck(deck, res);
            });
        }
        else {
            ReturnError(res, `Deck request returned status code ${deckResponse.statusCode}`);
        }
    });
    deckRequest.end();
}

function SanitizeDeck(deck, res) {
    for (var i = 0; i < deck.list.length; i++) {
        var card = deck.list[i];
        card.Language = card.Language.toLowerCase();
        card.Printing = card.Printing.toUpperCase();

        if (card.Language == "") card.Language = "en";
        else if (card.Language == "ja") card.Language = "jp";
    }

    ReturnDeck(deck, res);
}

function ReturnError(res, message) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(message ? message : "Internal Server Error");
}

function WriteResponseHeaders(res) {
    res.writeHead(200, {
        "Content-Type": "text/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });
}

function ReturnDeck(deck, res) {
    WriteResponseHeaders(res);
    res.end(JSON.stringify(deck));
}

function GetImage(options, res) {
    mtgimg.fetch(options, (imgResponse) => {
        WriteResponseHeaders(res)
        res.end(JSON.stringify(imgResponse));
    });
}

function GetOracle(options, res) {
    mtgora.fetch(options, (oraResponse) => {
        WriteResponseHeaders(res)
        res.end(JSON.stringify(oraResponse));
    });
}

function RouteRequest(req, res) {
    var reqUrl = url.parse(req.url, true);
    var requestSplit = reqUrl.pathname.split("/");
    var mode = requestSplit[1].toLowerCase();

    try {
        if (mode == "deck") {
            var target = requestSplit[2];
            var deck = {
                name: "",
                description: "",
                url: "",
                slug: "",
                author: "",
                userpage: "",
                format: "",
                list: []
            };

            deck.url = hostDeckPath + target + "/";
            deck.slug = target;

            GetInfo(deck, target, res);
        }
        else if (mode == "img") {
            var options = reqUrl.query;
            GetImage(options, res);
        }
        else if (mode == "oracle") {
            var options = reqUrl.query;
            GetOracle(options, res);
        }
        else {
            fs.readFile(__dirname + '/index.html', function (err, data) {
                if (err) {
                    throw err;
                }

                var str;

                if (mode) {
                    str = data.toString().replace(/var initialQuery.*;/, `var initialQuery = "${mode}";`);
                }
                else {
                    str = data.toString();
                }

                str = str.replace(/var host.*;/, `var host = "http://${req.headers["host"]}/";`);

                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(str);
            });
        }
    }
    catch (ex) {
        console.log("[" + new Date().toJSON().substring(11, 19) + "] " + ex);
        ReturnError(res);
    }
}

module.exports = {
    handle: RouteRequest
}