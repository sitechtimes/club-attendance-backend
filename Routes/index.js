const express = require("express");
const router = new express.Router();
const readValue = require("../Controllers/googleSheet.Controller");

router.get("/", readValue.authSheetsMiddleware, readValue.readCell);
router.get(
  // this should later be change to a post later
  // this route will mark mark down their attendence
  "/qrCode",
  readValue.authSheetsMiddleware,
  readValue.compareQRCodeMiddleware,
  readValue.writeName
);

module.exports = router;
