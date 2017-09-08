const http = require("http");
const $ = require("cheerio");

const searchUrl = "http://magiccards.info/query?v=scan&s=cname&q=";

function GetImage(options, callback) {
    var name = options.name;
    var set = options.set;
    var lang = options.lang;

    var query = `${encodeURIComponent("++o!")}"${name.replace(" ", "+")}"`;

    if (set == "000") {
        // Search promos by "special" rarity
        query += "+r:special";
    }
    else if (set != "") {
        query += "+e:" + set;
    }

    if (lang != "") {
        query += "+l:" + lang;
    }

    var req = http.get(searchUrl + query, (res) => {
        if (res.statusCode == 200) {
            var responseString = "";
            res.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                var results = [];
                $("img[src*='magiccards.info/scans']", responseString).each((i, element) => {
                    results[i] = {
                        name: $(element).attr("alt"),
                        url: $(element).attr("src")
                    };
                });

                if (results.length == 0 && options.lang != "") {
                    options.lang = "";
                    GetImage(options, callback);
                }
                else if (results.length == 0 && options.set != "") {
                    options.set = "";
                    GetImage(options, callback);
                }
                else {
                    callback(results);
                }
            });
        }
        else {
            callback(null, `Image search failed with status code ${res.statusCode}`);
        }
    }).end();
}

module.exports = {
    fetch: GetImage
}