const express = require("express");
const router = new express.Router();
const readValue = require("../Controllers/googleSheet.Controller");

router.get("/", readValue.authSheetsMiddleware, readValue.readCell);

module.exports = router;
