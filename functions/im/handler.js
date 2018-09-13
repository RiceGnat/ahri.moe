const express = require("express");
const request = require("request");

const defaultExtension = "jpg";
const twitterHandle = "@ricegnat";
const title = "Screenshot";

module.exports = express.Router()
.get("/:targetName", (req, res) => {
    const targetName = req.params.targetName;

    if (!targetName)
        return res.status(404).send();

    // Ignore favicon requests
    if (targetName == "favicon.ico")
        return res.status(204).send();

    const target = targetName.split(".");
    const extension = target[1] || defaultExtension;

    // Make a HEAD request to check that the image is present
    request({
        url: `http://www.ricegnat.com/junk/${target[0]}.${extension}`,
        method: "HEAD"
    }, (err, resp) => {
        if (err)
            return res.status(500).send();

        if (resp.statusCode !== 200)
            return res.status(resp.statusCode).send(`Remote server returned with ${resp.statusCode}: ${resp.statusMessage}`);
        
        // Construct meta tag response
        const redirectUrl = `//i.ahri.moe/${targetName}`;
        const timestamp = resp.headers["last-modified"];
        const body  = `<meta name="twitter:card" content="summary_large_image" />`
                    + `<meta name="twitter:site" content="${twitterHandle}" />`
                    + `<meta name="twitter:title" content="${title}" />`
                    + `<meta name="twitter:description" content="${timestamp}" />`
                    + `<meta name="twitter:image" content="${redirectUrl}" />`
                    + `<script>window.location.replace("${redirectUrl}");</script>`;

        res.send(body);
    })
});