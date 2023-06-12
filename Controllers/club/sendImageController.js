"use strict";

const { getOneData } = require("../../utility");
require("dotenv").config();
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;

exports.getDriveId = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    let clubCode = req.body.clubCode;
    console.log(req.body.clubCode, "cavkjakjsclkj");
    const club = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      clubCode,
      15
    );
    req.driveId = club[14];
    console.log(req.driveId, "faskl");
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.getAttendenceImageId = async (req, res, next) => {
  try {
    const driveService = req.driveService;
    const files = [];
    const driveRes = await driveService.files.list({
      q: `'${req.driveId}' in parents`,
      fields: "nextPageToken, files(id, name)",
      spaces: "drive",
    });
    Array.prototype.push.apply(files, driveRes.files);
    driveRes.data.files.forEach(function (file) {
      console.log("Found file:", file.name, file.id);
    });
    const file = driveRes.data.files;
    return res.json(file);
  } catch (error) {
    console.log(error);
  }
};
