"use strict";
const express = require("express");
const router = new express.Router();
const uploadPhoto = require("../controllers/club/uploadPhotoController");

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

module.exports = router;
