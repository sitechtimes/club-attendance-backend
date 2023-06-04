"use strict";
require("dotenv").config();
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const { sheetData } = require("../../utility.js");

exports.showClubDescription = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    const allClubData = await sheetData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData"
    );

    //this array will store the object from
    //changing arrays in sheetValue into object
    let sheetArray = [];

    //this is what change the array into object
    allClubData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //Do we want email???
    const sheetObject = sheetArray.map((value) => ({
      clubName: value[0],
      advisor: value[1],
      president: value[2],
      frequency: value[3],
      day: value[4],
      room: value[5],
      activityType: value[6],
      nextMeeting: [value[10]],
      clubDescription: value[16],
    }));

    sheetObject.shift();
    console.log(sheetObject);
    res.send(sheetObject);
  } catch (error) {
    console.log(error);
    res.json("Backend error!");
  }
};
