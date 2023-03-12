"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
require("dotenv").config({ path: "./env/driveId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const CLUB_ATTENDENCE_FOLDERID = `${process.env.CLUB_ATTENDENCE_FOLDERID}`;
const OWNER_EMAIL = `${process.env.OWNER_EMAIL}`;
const {
  sheetData,
  addItemToRow,
  appendNewItemToColumn,
  generateRandomString,
  uploadToFolder,
  createSheetinFolder,
} = require("../../utility.js");

//a bug on keep adding
exports.generateNewItem = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    await addItemToRow(sheets, NEW_CLUB_DATA_SPREADSHEETID, "userData", 0, [
      "Next Meeting",
      "QR Code",
      "Club SpreadsheetId",
      "Club Code",
      "Row Number",
    ]);
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateRowItem = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    const clubNameData = await sheetData(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!A:A"
    );
    clubNameData.shift();

    const clubNameDataLength = clubNameData.flat().length;

    console.log(clubNameDataLength);

    const rowNumber = [];
    for (let i = 2; clubNameDataLength + 1 >= i; i++) {
      rowNumber.push(i);
    }

    const clubCode = [];
    for (let i = 2; clubNameDataLength + 1 >= i; i++) {
      clubCode.push(generateRandomString(6));
    }

    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!O2:O",
      rowNumber
    );
    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!N2:N",
      clubCode
    );

    req.clubNameData = clubNameData.flat();
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateAcdemicYearDriveFolder = async (req, res, next) => {
  try {
    let drive = req.driveService;
    const currentYear = new Date().getFullYear();
    const acdemicYearFolderId = await uploadToFolder(
      drive,
      CLUB_ATTENDENCE_FOLDERID,
      `${currentYear}-${currentYear + 1}`
    );

    req.acdemicYearFolderId = acdemicYearFolderId;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.generateClubSpreadsheetFolder = async (req, res, next) => {
  try {
    let drive = req.driveService;

    const childFolderId = req.acdemicYearFolderId;
    const spreadsheetName = req.clubNameData;

    const spreadsheetId = [];

    //replace 2 with spreadsheetName.length
    for (let i = 0; 2 >= i; i++) {
      const id = await uploadToFolder(drive, childFolderId, spreadsheetName[i]);

      spreadsheetId.push({ spreadsheetName: spreadsheetName[i], id: id });
    }

    return res.json("done");
  } catch (error) {
    console.log(error);
  }
};
