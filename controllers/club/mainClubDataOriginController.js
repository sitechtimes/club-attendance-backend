"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
  sheetData,
  ifValueExist,
  addUserData,
  getUserData,
  findAndUpdateValue,
  ifValueExistBinary,
  sortColumn,
} = require("../../utility.js");

exports.generateNewItem = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
