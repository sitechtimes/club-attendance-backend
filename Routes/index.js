const express = require("express");
const router = new express.Router();
const mainValue = require("../Controllers/mainSheet.Controller");
const sheetAuth = require("../Controllers/googleSheetAuthController");
const markingAttendence = require("../Controllers/markAttendenceController");
const joinClub = require("../Controllers/joinClubController");
const AttendeceDate = require("../Controllers/createAttendenceDateController");
const login = require("../Controllers/verificationMiddleware");

router.post("/login", login.loginMiddleware, login.studentOrTeacher);

//read the main google spreadsheet data
router.get("/", sheetAuth.authSheetsMiddleware, mainValue.readCell);

//read the club google spreadsheet data
router.get(
  "/readClub",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  joinClub.readCell
);

//create user using club code comparison
router.post(
  "/addMember",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  joinClub.addUserToClub
);

//log attendence using qr code comparison
router.post(
  // this should later be change to a post later
  // this route will mark mark down their attendence
  "/markAttendence",
  sheetAuth.authSheetsMiddleware,
  markingAttendence.compareQRCodeMiddleware,
  markingAttendence.markAttendence
);

//adds attendence date to club spreadsheet
router.post(
  "/createAttendenceDate",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  AttendeceDate.createAttendeceDate
);

module.exports = router;
