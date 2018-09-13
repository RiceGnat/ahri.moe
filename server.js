const express = require("express");
const subdomain = require("express-subdomain");
const fs = require("fs");
const path = require("path");

const port = (process.env.PORT || 8080);
const f = path.join(__dirname, "modules");
const app = express();

fs.readdir(f, (err, files) => {
    for (file of files) {
        app.use(subdomain(file, require(path.join(f, file, "handler.js"))));
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});