const http = require("https");
const $ = require("cheerio");

const searchUrl = "https://magiccards.info/query?v=scan&s=cname&q=";

function GetImage(options, callback) {
    var name = options.name;
    var set = options.set;
    var lang = options.lang;

    var query = `${encodeURIComponent("++o!")}"${name.replace(" ", "+")}"`;

    if (set == "000" || set == "PSG") {
        query += "+is:promo";
    }
    else if (set) {
        query += "+e:" + set;
    }
    else {
        query += "+not+r:special"
    }

    if (lang) {
        query += "+l:" + lang;
    }

    var req = http.get(searchUrl + query, (res) => {
        if (res.statusCode == 200) {
            var responseString = "";
            res.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                var results = [];
                $("img[src*='/scans']", responseString).each((i, element) => {
                    results[i] = {
                        name: $(element).attr("alt"),
                        url: "https://magiccards.info/" + $(element).attr("src")
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