"use strict";
require("dotenv").config();

//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  getOneData,
  sheetData,
  ifValueExistBinary,
} = require("../../utility.js");

//this lets us read all the data from main spreadsheet
exports.allClubData = async (req, res) => {
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

    //this will have a new array that rearrange the data into better
    //formatting
    const sheetObject = sheetArray.map((value) => ({
      clubName: value[0],
      advisor: value[1],
      president: value[2],
      frequency: value[3],
      day: value[4],
      room: value[5],
      activityType: value[6],
      advisorEmail: value[8],
      presidentEmail: value[9],
      nextMeeting: value[10],
      clubCode: value[15],
      clubDescription: value[16],
    }));
    sheetObject.shift();

    res.send(sheetObject);
  } catch (error) {
    console.log(error);
  }
};

//this will check if club exist
//if club exist, return spreadsheetid
exports.ifClubExist = async (req, res, next) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data
    const userClub = req.body; //this is the data from the frontend
    //this specific which google spreadsheet we are acessing
    const clubRange = "clubData";

    const ifClubExist = await ifValueExistBinary(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      `${clubRange}!P:P`,
      userClub.clubCode
    );
    if (ifClubExist === false) {
      return res.json("no such club");
    }

    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.returnSheetId = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userClub = req.body;

    const clubRange = "clubData";

    const clubData = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      clubRange,
      userClub.clubCode,
      15
    );

    req.clubData = clubData;
    req.sheetId = clubData[13];
    return next();
  } catch (error) {
    console.log(error);
  }
};

//this will read all the spreadsheet data
exports.readAClub = async (req, res) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    //this specific which google spreadsheet we are acessing

    const clubData = await sheetData(sheets, req.sheetId, "Sheet1");

    let sheetArray = [];

    //this is what change the array into object
    clubData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting

    const sheetObject = sheetArray.map((value) => ({
      uid: value[0],
      firstName: value[1],
      lastName: value[2],
      osis: value[3],
      position: value[4],
      grade: value[5],
      email: value[6],
      officalClass: value[7],
      numbOfAttendence: value[8],
    }));
    sheetObject.shift();

    res.json(sheetObject);
  } catch (error) {
    // need better error handling
    // https://expressjs.com/en/guide/error-handling.html
    // create a middleware fpr event handling
    console.log(error);
    if (
      error.response.data.error.message === "Requested entity was not found."
    ) {
      res.json("Invaild Club Code");
    }
  }
};

//this will read all the spreadsheet data
exports.readAClubPresident = async (req, res) => {
  try {
    const sheets = req.object.sheets; //this is needed to get google spreadsheet data

    //this specific which google spreadsheet we are acessing

    const clubData = await sheetData(sheets, req.sheetId, "Sheet1");

    let sheetArray = [];

    //this is what change the array into object
    clubData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting

    const sheetObject = sheetArray.map((value) => ({
      uid: value[0],
      firstName: value[1],
      lastName: value[2],
      position: value[4],
      grade: value[5],
      email: value[6],
      officalClass: value[7],
      numbOfAttendence: value[8],
    }));
    sheetObject.shift();

    console.log(sheetObject);

    res.json(sheetObject);
  } catch (error) {
    // need better error handling
    // https://expressjs.com/en/guide/error-handling.html
    // create a middleware fpr event handling
    console.log(error);
    if (
      error.response.data.error.message === "Requested entity was not found."
    ) {
      res.json("Invaild Club Code");
    }
  }
};
