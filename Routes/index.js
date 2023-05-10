"use strict";
const express = require("express");
const router = new express.Router();
const clubData = require("../Controllers/clubDataController");
const sheetAuth = require("../Controllers/googleSheetAuthController");
const markingAttendence = require("../Controllers/markAttendenceController");
const joinClub = require("../Controllers/joinClubController");
const AttendeceDate = require("../Controllers/createAttendenceDateController");
const verify = require("../Controllers/verificationController");
const userLogic = require("../Controllers/userLogicController");
const addClub = require("../Controllers/clubcode");
const clubAttendence = require("../Controllers/clubAttendenceController");
const addMeeting = require("../Controllers/newMeeting");
const removeMeeting = require("../Controllers/deleteMeeting");

router.post("/deleteMeeting", removeMeeting.deleteMeeting);

router.post("/newMeeting", addMeeting.newMeeting);

router.get("/getMeeting");

router.post("/addclub", addClub.addClubCode, addClub.addUserDataToClub);

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

router.post("/addMeeting", addMeeting.newMeeting);

router.post(
  "/login",
  verify.gmailVerification,
  sheetAuth.authSheets,
  userLogic.ifUserExist,
  userLogic.sendUserData,
  userLogic.createNewUser,
  userLogic.ifPresident
);

router.post(
  "/addOsisGradeOfficalClass",
  sheetAuth.authSheets,
  verify.verifyUserInDb,
  userLogic.addOsisGradeOfficalClass
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
