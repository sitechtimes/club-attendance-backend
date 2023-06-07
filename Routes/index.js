"use strict";
const express = require("express");
const router = new express.Router();
const addMeeting = require("../controllers/club/newMeeting");
const removeMeeting = require("../controllers/club/deleteMeeting");

router.post(
  "/deleteMeeting",
  sheetAuth.authSheets,
  removeMeeting.deleteMeeting
);

router.post("/addMeeting", sheetAuth.authSheets, addMeeting.newMeeting);

module.exports = router;
