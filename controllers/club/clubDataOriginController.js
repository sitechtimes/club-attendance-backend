"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  sheetData,
  addItemToRow,
  appendNewItemToColumnOrRow,
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

exports.generateRowNumber = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const clubNameData = await sheetData(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!A:A"
    );
    const clubNameDataLength = clubNameData.flat().length;
    console.log(clubNameDataLength);
    const numberArray = [1, 2, 3, 4, 5, 6, 7, 8];
    await appendNewItemToColumnOrRow(
      sheets,
      NEW_CLUB_DATA_SPREADSHEETID,
      "userData!O1:O",
      numberArray
    );
  } catch (error) {
    console.log(error);
  }
};
