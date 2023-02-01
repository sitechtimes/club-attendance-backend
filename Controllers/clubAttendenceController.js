"use strict";

require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const { sheetData, getSheetNames } = require("../utility.js");

//get all the club attendence data
exports.getClubAttendenceDate = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    const attendeceDate = await getSheetNames(sheets, req.sheetId).then(
      (response) => {
        response.shift();
        return response;
      }
    );

    console.log(attendeceDate);
    res.json(attendeceDate);
  } catch (error) {
    console.log(error);
  }
};

exports.getClubAttendenceData = async (req, res) => {
  try {
    const incomingData = req.body;
    const sheets = req.object.sheets;
    const attendence = await sheetData(
      sheets,
      req.sheetId,
      incomingData.attendenceDate
    );

    let sheetArray = [];
    attendence.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting
    const attendenceData = sheetArray.map((value) => ({
      firstName: value[0],
      lastName: value[1],
      osis: value[2],
      grade: value[3],
      officalClass: value[4],
      uid: value[5],
      status: value[6],
    }));
    attendenceData.shift();

    //retrun the data
    res.json(attendenceData);

    console.log(attendence);
  } catch (error) {
    console.log(error);
  }
};

exports.generateQRcode = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
  } catch (error) {
    console.log(error);
  }
};
