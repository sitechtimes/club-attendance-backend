"use strict";
const express = require("express");
const router = new express.Router();
const clubData = require("../controllers/club/clubDataController");
const sheetAuth = require("../controllers/services/sheetAuthController");
const driveAuth = require("../controllers/services/driveAuthController");
const markingAttendence = require("../controllers/club/markAttendenceController");
const joinClub = require("../controllers/club/joinClubController");
const AttendeceDate = require("../controllers/club/createAttendenceDateController");
const verify = require("../controllers/user/verificationController");
const userLogic = require("../controllers/user/postUserController");
const addClub = require("../controllers/club/clubcode");
const clubAttendence = require("../controllers/club/clubAttendenceController");
const updateClubData = require("../controllers/club/clubDataOriginController");

//make sure user has authorize power: need route!
router.get(
  "/update-club-data",
  sheetAuth.authSheets,
  updateClubData.generateNewItem,
  updateClubData.generateRowItem,
  driveAuth.getDriveService,
  updateClubData.generateAcdemicYearDriveFolder,
  updateClubData.generateClubSheetAndFolder,
  updateClubData.uploadIdToClubData
);

router.post(
  "/login",
  verify.gmailVerification,
  sheetAuth.authSheets,
  userLogic.ifUserExist,
  userLogic.sendUserData,
  userLogic.createNewUser
);

router.post(
  "/addOsisGradeOfficalClass",
  sheetAuth.authSheets,
  verify.verifyUserInDb,
  userLogic.addOsisGradeOfficalClass
);

router.get("/get-all-user-data", sheetAuth.authSheets, userLogic.allUserData);

router.post(
  "/mark-attendence",
  clubData.ifClubExist,
  clubAttendence.getQrcode,
  clubData.returnSheetId
);

router.post(
  "/get-qrcode",
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubAttendence.generateSheetData,
  clubAttendence.userCopyToAttendence,
  clubAttendence.generateQrCodeOnSheet,
  clubAttendence.generateQrCode,
  clubAttendence.totalMeeting
);

//read the main google spreadsheet data
//need ti create auth
router.get(
  "/all-club-data", // "/"
  sheetAuth.authSheets,
  clubData.allClubData
);

//read the club google spreadsheet data
router.post(
  "/one-club-data", //readClub
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubData.readAClub
);

router.post(
  "/get-club-attendence-date",
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubAttendence.getClubAttendenceDate
);

router.post(
  "/get-club-attendence-data",
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubAttendence.getClubAttendenceData
);

//the bottom need refactorization

//create user using club code comparison
// router.post(
//   "/addMember",
//   sheetAuth.authSheetsMiddleware,
//   joinClub.ifClubExist,
//   clubData.returnSheetId,
//   joinClub.addUserToClub
// );

//log attendence using qr code comparison
router.post(
  // this should later be change to a post later
  // this route will mark mark down their attendence
  "/markAttendence",
  sheetAuth.authSheets,
  markingAttendence.compareQRCodeMiddleware,
  markingAttendence.markAttendence
);

//adds attendence date to club spreadsheet
router.post(
  "/createAttendenceDate",
  sheetAuth.authSheets,
  joinClub.compareClubCodeMiddleware,
  AttendeceDate.createAttendeceDate
);

router.get("/addclub", addClub.addClubCode, addClub.addUserDataToClub);

router.get("/test", sheetAuth.authSheets, verify.verifyUserInDb);

module.exports = router;
