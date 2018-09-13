const express = require("express");
const path = require("path");
console.log(path.join(__dirname, "web-resources/public"));
module.exports = express.Router()
.use("/", express.static(path.join(__dirname, "web-resources/public")));