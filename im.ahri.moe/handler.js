var http = require("http");
var url = require("url");

var targetProtocol = "http://";
var targetHost = "www.ricegnat.com";
var targetPathStub = "/junk/";
var extension = ".jpg";
var twitterHandle = "@ricegnat";
var title = "Screenshot";
var redirectUrl = "http://i.ahri.moe/"

function LoadImageMeta(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1);

    try {
        if (targetName == "favicon.ico") {
            // Ignore favicon requests
            res.writeHead(204);
            res.end();
        }
        else {
            var options = {
                host: targetHost,
                hostname: targetHost,
                method: "HEAD",
                path: targetPathStub + targetName + extension
            };

            // Make a HEAD request to the target server (checks that the image is present)
            var headRequest = http.request(options, function (headResponse) {
                if (headResponse.statusCode == 200) {
                    // Build target image URL
                    var targetUrl = redirectUrl + targetName;

                    // Get image date
                    var timestamp = headResponse.headers["last-modified"];

                    // Construct meta tags
                    var meta = '<meta name="twitter:card" content="summary_large_image" />'
                             + '<meta name="twitter:site" content="' + twitterHandle + '" />'
                             + '<meta name="twitter:title" content="' + title + '" />'
                             + '<meta name="twitter:description" content="' + timestamp + '" />'
                             + '<meta name="twitter:image" content="' + targetUrl + '" />';

                    // Redirect the client to the image
                    var script = '<script>window.location.replace("' + targetUrl + '");</script>';

                    // Write response
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(meta + script);
                }
                else {
                    // Request for the target image failed
                    res.writeHead(headResponse.statusCode);
                }
                res.end();
            });
            headRequest.end();
        }
    }
    catch (ex) {
        console.log("[" + new Date().toJSON().substring(11, 19) + "] " + ex);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
}

module.exports = {
    handle: LoadImageMeta
}