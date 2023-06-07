"use strict";
const express = require("express");
const router = new express.Router();
const sheetAuth = require("../controllers/services/sheetAuthController");
const addClubDescription = require("../Controllers/club/addClubDescriptionController");
const showClubDescription = require("../Controllers/club/showClubDescriptionController");

router.get(
  "/get-all-club-student",
  sheetAuth.authSheets,
  showClubDescription.showClubDescription
);

router.post(
  "/update-description",
  sheetAuth.authSheets,
  addClubDescription.addClubDescription
);

module.exports = router;
