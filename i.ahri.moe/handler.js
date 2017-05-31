var http = require("http");
var url = require("url");

var targetHost = "www.ricegnat.com";
var targetPathStub = "/junk/";
var extension = ".jpg";

function LoadImage(req, res) {
    var targetName = url.parse(req.url).pathname.substr(1);

    try {
        if (targetName == "favicon.ico") {
            // Ignore favicon requests
            res.writeHead(404);
            res.end();
        }
        else {
            var options = {
                host: targetHost,
                hostname: targetHost,
                method: "GET",
                path: targetPathStub + targetName + extension
            };

			// Fetch target image
			var imgRequest = http.request(options, function (imgResponse) {
				if (imgRequest.statusCode == 200) {
					var data;
					
					imgResponse.on('data', function (chunk) {
						data += chunk;
					});
					
					imgResponse.on('end', function () {
						res.writeHead(200, { "Content-Type": "image/jpeg"});
						res.write(data);
						res.end();
					});
					
				}
				else {
					res.writeHead(imgResponse.statusCode);
					res.end();
				}
			});
            imgRequest.end();
        }
    }
    catch (ex) {
        console.log("[" + new Date().toJSON().substring(11, 19) + "] " + ex);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
}

module.exports = {
    handle: LoadImage
}