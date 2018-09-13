const express = require("express");
const path = require("path");

const port = (process.env.PORT || 8080);

express().use(require(path.join(__dirname, "modules", process.argv[2], "router.js")))
.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});