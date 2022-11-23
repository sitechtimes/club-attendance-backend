const express = require("express");
const router = new express.Router();
const mainValue = require("../Controllers/mainSheet.Controller");
const sheeAuth = require("../Controllers/googleSheetAuthController");
const markingAttendence = require("../Controllers/qrCodeController");

router.get("/", sheeAuth.authSheetsMiddleware, mainValue.readCell);
router.get(
  // this should later be change to a post later
  // this route will mark mark down their attendence
  "/qrCode",
  sheeAuth.authSheetsMiddleware,
  markingAttendence.compareQRCodeMiddleware,
  markingAttendence.writeName
);
router.get();

module.exports = router;
