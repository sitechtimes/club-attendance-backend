"use strict";
const express = require("express");
const addClub = require("../controllers/club/clubcode");

router.post(
  "/addClub",
  sheetAuth.authSheets,
  addClub.addUserDataToClub,
  addClub.updateUserClubs
);

module.exports = router;
