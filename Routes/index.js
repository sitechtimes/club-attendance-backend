"use strict";
const express = require("express");
const router = new express.Router();
const clubData = require("../Controllers/club/clubDataController");
const sheetAuth = require("../Controllers/services/sheetAuthController");
const driveAuth = require("../Controllers/services/driveAuthController");
const markingAttendence = require("../Controllers/club/markAttendenceController");
const joinClub = require("../Controllers/club/joinClubController");
const verify = require("../Controllers/user/verifyController");
const postUser = require("../Controllers/user/userController");
const getAllUser = require("../Controllers/user/getAllUserController");
const addClub = require("../Controllers/club/clubcode");
const clubAttendence = require("../Controllers/club/clubAttendenceController");
const updateClubData = require("../Controllers/club/clubOriginController");
const addMeeting = require("../Controllers/club/newMeeting");

//make sure user has authorize power: need route!
router.get(
  "/update-club-data",
  sheetAuth.authSheets,
  updateClubData.generateNewItem,
  updateClubData.generateRowItem,
  driveAuth.getDriveService,
  updateClubData.generateAcdemicYearDriveFolder,
  updateClubData.generateClubSheetAndFolder,
  updateClubData.generaterRowForClub,
  updateClubData.uploadIdToClubData
);

router.post(
  "/login",
  verify.gmailVerification,
  sheetAuth.authSheets,
  postUser.ifUserExist,
  postUser.sendUserData,
  postUser.createNewUser
);

router.post(
  "/addOsisGradeOfficialClass",
  sheetAuth.authSheets,
  verify.verifyUserInDb,
  postUser.addOsisGradeOfficialClass
);

router.get("/get-all-user-data", sheetAuth.authSheets, getAllUser.allUserData);

//dont know what this route does
router.post(
  "/mark-attendence",
  sheetAuth.authSheets,
  clubAttendence.getQrcode,
  clubAttendence.markAttendence
);

router.post(
  "/manually-mark-attendence",
  sheetAuth.authSheets,
  clubAttendence.manuallyPresentAbsent,
  clubAttendence.manuallyPresentAbsent2
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

router.post("/addMeeting", addMeeting.newMeeting);

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

router.get("/addclub", addClub.addUserDataToClub);

router.get("/test", sheetAuth.authSheets, verify.verifyUserInDb);

module.exports = router;
