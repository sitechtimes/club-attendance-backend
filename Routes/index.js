"use strict";
const express = require("express");
const router = new express.Router();
const clubData = require("../controllers/club/clubDataController");
const sheetAuth = require("../controllers/services/sheetAuthController");
const driveAuth = require("../controllers/services/driveAuthController");
const markingAttendence = require("../controllers/club/markAttendenceController");
const joinClub = require("../controllers/club/joinClubController");
const verify = require("../controllers/user/verifyController");
const postUser = require("../controllers/user/userController");
const getAllUser = require("../controllers/user/allUserController");
const clubAttendence = require("../controllers/club/clubAttendenceController");
const updateClubData = require("../controllers/club/clubOriginController");
const addMeeting = require("../controllers/club/newMeeting");
const addClub = require("../controllers/club/clubcode");
const removeMeeting = require("../controllers/club/deleteMeeting");
const uploadPhoto = require("../controllers/club/uploadPhotoController");
const admin = require("../controllers/user/adminController");
const deleteClub = require("../controllers/club/deleteClub");
const deleteClubTeacher = require("../controllers/club/deleteClubTeacher");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/upload-attendance",
  upload.single("file"),
  driveAuth.getDriveService,
  sheetAuth.authSheets,
  uploadPhoto.uploadPhoto
);

//make sure user has authorize power: need route!
router.post(
  "/update-club-data",
  admin.adminCheck,
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

//here
router.post(
  "/get-all-user-data",
  admin.adminCheck,
  sheetAuth.authSheets,
  getAllUser.allUserData
);

//dont know what this route does
router.post(
  "/mark-attendence",
  sheetAuth.authSheets,
  clubAttendence.getQrcode,
  clubAttendence.markAttendence,
  clubAttendence.updateLocation
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
router.post(
  "/all-club-data", // "/"
  admin.adminCheck,
  sheetAuth.authSheets,
  clubData.allClubData
);

//need admin
router.post(
  "/one-club-data", //readClub
  admin.adminCheck,
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubData.readAClub
);

router.post(
  "/one-club-data-president", //readClub
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubData.readAClubPresident
);

router.post("/addMeeting", addMeeting.newMeeting);

router.post(
  "/get-club-attendence-date",
  admin.adminCheck,
  sheetAuth.authSheets,
  clubData.ifClubExist,
  clubData.returnSheetId,
  clubAttendence.getClubAttendenceDate
);

router.post(
  "/get-club-attendence-data",
  admin.adminCheck,
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

router.post("/deleteClub", sheetAuth.authSheets, deleteClub.removeClub);

router.post("/deleteClubTeacher", sheetAuth.authSheets, deleteClubTeacher.removeClub);

router.post(
  "/addClub",
  sheetAuth.authSheets,
  addClub.addUserDataToClub,
  addClub.updateUserClubs
);

router.post(
  "/deleteMeeting",
  sheetAuth.authSheets,
  removeMeeting.deleteMeeting
);

router.get("/test", sheetAuth.authSheets, verify.verifyUserInDb);

router.post("/addMeeting", sheetAuth.authSheets, addMeeting.newMeeting);

module.exports = router;
