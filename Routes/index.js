const express = require("express");
const router = new express.Router();
const clubData = require("../Controllers/clubDataController");
const sheetAuth = require("../Controllers/googleSheetAuthController");
const markingAttendence = require("../Controllers/markAttendenceController");
const joinClub = require("../Controllers/joinClubController");
const AttendeceDate = require("../Controllers/createAttendenceDateController");
const verify = require("../Controllers/verificationController");
const userLogic = require("../Controllers/userLogicController");
const getAttendence = require("../Controllers/getAttendenceController");
const addClub = require("../Controllers/clubcode");
const addAttendence = require("../Controllers/addAttendeceDateController");

//read the main google spreadsheet data
//need ti create auth
router.get(
  "/all-club-data", // "/"
  sheetAuth.authSheetsMiddleware,
  clubData.allClubData
);

//read the club google spreadsheet data
router.post(
  "/one-club-data", //readClub
  sheetAuth.authSheetsMiddleware,
  clubData.compareClubCodeMiddleware,
  clubData.readAClub
);

router.post(
  "/login",
  verify.verifyByGmailMiddleware,
  sheetAuth.authSheetsMiddleware,
  userLogic.checkUserData,
  userLogic.sendBackUserData,
  userLogic.createNewUser
);

router.post(
  "/addOsisGradeOfficalClass",
  sheetAuth.authSheetsMiddleware,
  verify.verifyUser,
  userLogic.addOsisGradeOfficalClass
);

router.post(
  "/attendence-date",
  sheetAuth.authSheetsMiddleware,
  joinClub.compareClubCodeMiddleware,
  joinClub.getAttendenceDate
);

//the bottom need refactorization

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

router.get("/addclub", addClub.addClubCode, addClub.addUserDataToClub);

router.post("/test");

module.exports = router;
