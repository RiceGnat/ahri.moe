const http = require("http");
const url = require("url");
const parse = require("csv-parse/lib/sync");
const $ = require("cheerio");

const mtgimg = require("./mtg-imgs.js");

const host = "http://tappedout.net";
const deckPath = "/mtg-decks/";
const userPath = "/users/"
const printFlag = "fmt=printable";
const csvFlag = "fmt=csv";

function GetInfo(deck, target, res) {
    var path = deck.url + "?" + printFlag;

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
                deck.userpage = host + userPath + deck.author;
                deck.format = $("tr:contains(Format) > td", responseString).last().text();

                GetCards(deck, target, res);
            });
        }
        else {
            throw `Info request returned status code ${deckResponse.statusCode}`;
        }
    });
    deckRequest.end();
}

function GetCards(deck, target, res) {
    var path = deck.url + "?" + csvFlag;

    var deckRequest = http.get(path, (deckResponse) => {
        if (deckResponse.statusCode == 200) {
            var responseString = "";
            deckResponse.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                // This is a typo from tappedout.net
                responseString = responseString.replace("Languange", "Language");

                deck.list = parse(responseString, { columns: true });

                FetchImages(deck, res);
            });
        }
        else {
            throw `Deck request returned status code ${deckResponse.statusCode}`;
        }
    });
    deckRequest.end();
}

function FetchImages(deck, res) {
    var completeCount = 0;
    for (var i = 0; i < deck.list.length; i++) {
        var card = deck.list[i];
        card.Language = card.Language.toLowerCase();

        if (card.Language == "") card.Language = "en";
        else if (card.Language == "ja") card.Language = "jp";

        var options = {
            name: card.Name,
            set: card.Printing,
            lang: card.Language
        };

        function AssignImage(card) {
            return function (results) {
                card.Image = results;
                completeCount++;

                if (completeCount == deck.list.length)
                    ReturnDeck(deck, res);
            };
        }

        mtgimg.fetch(options, AssignImage(card));
    }
}

function ReturnDeck(deck, res) {
    res.writeHead(200, {
        "Content-Type": "text/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify(deck));
}

function LoadDeck(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1).replace(/\/$/, "");

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

    deck.url = host + deckPath + targetName + "/";
    deck.slug = targetName;

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
            GetInfo(deck, targetName, res);
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