"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const { addItemToRow } = require("../../utility.js");

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
  } catch (error) {
    console.log(error);
  }
};
