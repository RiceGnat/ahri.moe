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
            res.writeHead(200);
            res.end();
        }
        else {
            var options = {
                hostname: targetHost,
                method: "GET",
                path: targetPathStub + targetName + extension
            };

			// Fetch target image
			var imgRequest = http.request(options, function (imgResponse) {
				if (imgResponse.statusCode == 200) {
					var data = "";
					
					// Read image data
					imgResponse.setEncoding('binary');
					imgResponse.on('data', function (chunk) {
						data += chunk;
					});
					
					// Resend image in response
					imgResponse.on('end', function () {
						res.writeHead(200, { "Content-Type": "image/jpeg"});
						res.end(data, 'binary');
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