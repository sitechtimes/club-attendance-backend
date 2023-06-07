"use strict";
const express = require("express");
const router = new express.Router();
const sheetAuth = require("../controllers/services/sheetAuthController");
const driveAuth = require("../controllers/services/driveAuthController");
const updateClubData = require("../Controllers/club/clubOriginController");
const admin = require("../Controllers/user/adminController");

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

module.exports = router;
