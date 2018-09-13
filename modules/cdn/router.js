const express = require("express");

module.exports = express.Router()
.use("/", express.static("node_modules/web-resources/public"));