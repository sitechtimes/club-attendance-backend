"use strict";
const express = require("express");
const router = new express.Router();
const clubData = require("../controllers/club/clubDataController");
const sheetAuth = require("../controllers/services/sheetAuthController");
const clubAttendence = require("../controllers/club/clubAttendenceController");

//dont know what this route does
router.post(
  "/mark-attendence",
  sheetAuth.authSheets,
  clubAttendence.getQrcode,
  clubAttendence.markAttendence,
  clubAttendence.updateLocation
);

router.post(
  "/get-qrcode",
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubAttendence.generateSheetData,
  clubAttendence.userCopyToAttendence,
  clubAttendence.generateQrCodeOnSheet,
  clubAttendence.totalMeeting,
  clubAttendence.generateQrCode
);

module.exports = router;
