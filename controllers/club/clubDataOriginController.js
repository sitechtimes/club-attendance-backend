"use strict";
require("dotenv").config({ path: "./env/spreadsheetId.env" });
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  sheetData,
  addItemToRow,
  appendNewItemToColumn,
  generateRandomString,
  createNewSpreadSheet,
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

exports.generateClubSpreadsheet = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    const spreadsheetName = req.clubNameData;

    const spreadsheetId = [];
    //replace 1 with spreadsheetName.length
    for (let i = 0; 0 >= i; i++) {
      //change 1 to i
      console.log("start");
      const id = await createNewSpreadSheet(sheets, spreadsheetName[1]);
      spreadsheetId.push(id);
      console.log("end");
    }

    console.log(spreadsheetId);

    return res.json("done");
  } catch (error) {
    console.log(error);
  }
};
