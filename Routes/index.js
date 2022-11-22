const express = require("express");
const router = new express.Router();
const readValue = require("../Controllers/googleSheet.Controller");

router.get("/", readValue.authSheetsMiddleware, readValue.readCell);
router.get(
  "/qrCode",
  readValue.authSheetsMiddleware,
  readValue.compareQRCodeMiddleware,
  readValue.writeName
);

module.exports = router;
