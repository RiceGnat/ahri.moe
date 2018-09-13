const express = require("express");
const request = require("request");

const defaultExtension = "jpg";

const getSourceUrl = targetName => {
    const target = targetName.split(".");
    const extension = target[1] || defaultExtension;
    return `http://www.ricegnat.com/junk/${target[0]}.${extension}`;
};

module.exports = express.Router()
.get("/", (req, res) => {
    return res.status(204).send();
})
.get("/favicon.ico", (req, res) => {
    return res.status(204).send();
})
.get("/:targetName", (req, res) => {
    const targetName = req.params.targetName;

    request.get({
        url: getSourceUrl(targetName),
        encoding: null
    }, (err, resp, body) => {
        if (err)
            return res.status(500).send();

        if (resp.statusCode !== 200)
            return res.status(resp.statusCode).send(`Remote server returned with ${resp.statusCode}: ${resp.statusMessage}`);
        
        res.set("Content-Type", resp.headers["content-type"]).send(body);
    })
})
.get("/:targetName/t", (req, res) => {
    const targetName = req.params.targetName;
    const twitterHandle = "@ricegnat";
    const title = "Screenshot";

    const url = getSourceUrl(targetName);

    // Make a HEAD request to check that the image is present
    request({
        url: url,
        method: "HEAD"
    }, (err, resp) => {
        if (err)
            return res.status(500).send();

        if (resp.statusCode !== 200)
            return res.status(resp.statusCode).send(`Remote server returned with ${resp.statusCode}: ${resp.statusMessage}`);
        
        // Construct meta tag response
        const redirectUrl = `//${req.headers.host}/${targetName}`;
        const timestamp = resp.headers["last-modified"];
        const body  = `<meta name="twitter:card" content="summary_large_image" />`
                    + `<meta name="twitter:site" content="${twitterHandle}" />`
                    + `<meta name="twitter:title" content="${title}" />`
                    + `<meta name="twitter:description" content="${timestamp}" />`
                    + `<meta name="twitter:image" content="${url}" />`
                    + `<script>window.location.replace("${redirectUrl}");</script>`;

        res.send(body);
    })
});