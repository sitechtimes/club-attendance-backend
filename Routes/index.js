const express = require("express");
const router = new express.Router();
const mainValue = require("../Controllers/mainSheet.Controller");
const sheetAuth = require("../Controllers/googleSheetAuthController");
const markingAttendence = require("../Controllers/qrCodeController");
const joinClub = require("../Controllers/joinClubController");

//make a route to read every club sheet

router.get("/", sheetAuth.authSheetsMiddleware, mainValue.readCell);
router.get(
  // this should later be change to a post later
  // this route will mark mark down their attendence
  "/qrCode",
  sheetAuth.authSheetsMiddleware,
  markingAttendence.compareQRCodeMiddleware,
  markingAttendence.writeName
);

router.get(
  "/readClub",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  joinClub.readCell
);

router.post(
  "/addMember",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  joinClub.addUserToClub
);

module.exports = router;
