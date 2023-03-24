"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
require("dotenv").config({ path: "./env/driveId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const CLUB_ATTENDENCE_FOLDERID = `${process.env.CLUB_ATTENDENCE_FOLDERID}`;

const {
  sheetData,
  addItemToRow,
  appendNewItemToColumn,
  generateRandomString,
  uploadToFolder,
  createSheetInFolder,
} = require("../../utility.js");

//a bug on keep adding
exports.generateNewItem = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    await addItemToRow(sheets, NEW_CLUB_DATA_SPREADSHEETID, "userData", 0, [
      "Next Meeting",
      "QR Code",
      "Club Folder Id", //m
      "Club Spreadsheet Id", //n
      "Club Attendence Folder Id", //o
      "Club Code",
      "Club Code",
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
      "userData!Q2:Q",
      rowNumber
    );

    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!P2:P",
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

exports.generateClubSheetAndFolder = async (req, res, next) => {
  try {
    let drive = req.driveService;

    const childFolderId = req.acdemicYearFolderId;
    const spreadsheetName = req.clubNameData;

    const folderClubId = [];
    const folderAttendenceId = [];
    const idSpreadsheet = [];

    //replace 2 with spreadsheetName.length
    for (let i = 0; spreadsheetName.length - 1 >= i; i++) {
      const clubFolderId = await uploadToFolder(
        drive,
        childFolderId,
        spreadsheetName[i]
      );

      const attendenceFolderId = await uploadToFolder(
        drive,
        clubFolderId,
        "Club Attendence Photo"
      );

      const spreadsheetId = await createSheetInFolder(
        drive,
        clubFolderId,
        spreadsheetName[i]
      );

      folderClubId.push(clubFolderId);
      folderAttendenceId.push(attendenceFolderId);
      idSpreadsheet.push(spreadsheetId);
    }

    console.log(folderClubId, folderAttendenceId, idSpreadsheet);
    req.folderClubId = folderClubId;
    req.folderAttendenceId = folderAttendenceId;
    req.idSpreadsheet = idSpreadsheet;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.uploadIdToClubData = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!M2:M",
      req.folderClubId
    );
    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!N2:N",
      req.folderAttendenceId
    );
    await appendNewItemToColumn(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!O2:O",
      req.idSpreadsheet
    );
    return res.json("done");
  } catch (error) {
    console.log(error);
  }
};
