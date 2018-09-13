const express = require("express");
const path = require("path");

module.exports = express.Router()
.use("/", express.static(path.join(__dirname, "web-resources/public")));