"use strict";
require("dotenv").config();
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const CLUB_ATTENDENCE_FOLDERID = `${process.env.CLUB_ATTENDENCE_FOLDERID}`;
const {
  sheetData,
  addItemToRow,
  generateRandomNumber,
  uploadToFolder,
  createSheetInFolder,
  appendNewItemBatch,
} = require("../../utility.js");

exports.clearAllUser = async (req, res, next) => {
  try {
  } catch (error) {
    console.log();
  }
};
