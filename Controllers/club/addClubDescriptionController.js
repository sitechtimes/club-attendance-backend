"use strict";
require("dotenv").config();
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const { getOneData, updateValue } = require("../../utility.js");

exports.addClubDescription = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const club = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      req.body.clubCode,
      15
    );
    await updateValue(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      `clubData!Q${club[17]}`
    );
    return res.json("Updated club  description!");
  } catch (error) {
    console.log(error);
    res.json("Backend error");
  }
};

exports.test = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    await getOneData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData",
      req.body.uid,
      0
    );
  } catch (error) {
    console.log(error);
  }
};
