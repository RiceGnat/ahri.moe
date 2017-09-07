const http = require("http");
const $ = require("cheerio");

const searchUrl = "http://magiccards.info/query?q=";

function GetImage(options, callback) {
    var name = options.name;
    var set = options.set;
    var lang = options.lang;
    
    var query = name.replace(" ", "+");
    if (set == "000") {
        // Promo sets
        
    }
    else if (set != "") {
        query += "+e:" + set;
    }
    
    var req = http.get(searchUrl + query, (res)=> {
       if (res.statusCode == 200) {
            var responseString = "";
            res.on("data", (chunk) => {
                responseString += chunk;
            }).on("end", () => {
                callback($(`img[alt='${name}']`, responseString).first().attr("src"));
            });
        }
        else {
            throw `Image search returned status code ${res.statusCode}`;
        } 
    }).end();
}

module.exports = {
    fetch: GetImage
}