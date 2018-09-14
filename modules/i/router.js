const express = require("express");
const request = require("request");

module.exports = express.Router()
.get("/", (req, res) => {
    return res.status(204).send();
})
.get("/favicon.ico", (req, res) => {
    return res.status(204).send();
})
.get("/:targetName", (req, res) => {
    const targetName = req.params.targetName;
    const useMeta = req.query.t !== undefined;

    const target = targetName.split(".");
    const extension = target[1] || "jpg";
    const url = `http://www.ricegnat.com/junk/${target[0]}.${extension}`;

    // Either get image or check that image exists
    const options = !useMeta ? {
        url: url,
        method: "GET",
        encoding: null
    } : {
        url: url,
        method: "HEAD"
    };

    request(options, (err, resp, data) => {
        if (err)
            return res.status(500).send();

        if (resp.statusCode !== 200)
            return res.status(resp.statusCode).send(`Remote server returned with ${resp.statusCode}: ${resp.statusMessage}`);
        
        if (!useMeta) {
            // Send image
            res.set("Content-Type", resp.headers["content-type"]).send(data);
        }
        else {
            // Construct meta tag response
            const redirectUrl = `//${req.headers.host}/${targetName}`;
            const timestamp = resp.headers["last-modified"];
            const body  = `<meta name="twitter:card" content="summary_large_image" />`
                        + `<meta name="twitter:site" content="@ricegnat" />`
                        + `<meta name="twitter:title" content="Screenshot" />`
                        + `<meta name="twitter:description" content="${timestamp}" />`
                        + `<meta name="twitter:image" content="${url}" />`
                        + `<script>window.location.replace("${redirectUrl}");</script>`;

            res.send(body);
        }
    })
});