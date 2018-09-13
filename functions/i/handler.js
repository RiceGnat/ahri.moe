const express = require("express");
const request = require("request");

const defaultExtension = "jpg";

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

    request.get({
        url: `http://www.ricegnat.com/junk/${target[0]}.${extension}`,
        encoding: null
    }, (err, resp, body) => {
        if (err)
            return res.status(500).send();

        if (resp.statusCode !== 200)
            return res.status(resp.statusCode).send(`Remote server returned with ${resp.statusCode}: ${resp.statusMessage}`);
        
        res.set("Content-Type", resp.headers["content-type"]).send(body);
    })
});