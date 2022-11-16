const express = require("express");
const router = new express.Router();
const readValue = require("../Controllers/googleSheet.Controller");

router.get("/", readValue.authSheets, readValue.readCell);

module.exports = router;
