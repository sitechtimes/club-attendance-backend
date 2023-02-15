"use strict";
require("dotenv").config({ path: "variables.env" });
const QRCode = require("qrcode");
//google spreadsheet id for "Main-Club-Data"
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const {
  sheetData,
  getSheetNames,
  generateRandomString,
  findAndUpdateValue,
  createNewSheetWithName,
  addUserData,
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
} = require("../utility.js");

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
      uid: value[2],
      osis: value[3],
      position: value[4],
      grade: value[5],
      email: value[6],
      officalClass: value[7],
      status: value[8],
    }));
    attendenceData.shift();

    //retrun the data
    res.json(attendenceData);

    console.log(attendence);
  } catch (error) {
    console.log(error);
  }
};

exports.generateSheetData = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
    const sheets = req.object.sheets;
    const incomingData = req.body;
    const sheetId = req.sheetId;

    await createNewSheetWithName(sheets, sheetId, incomingData.dateOfToday);

    console.log(`You added date of ${incomingData.dateOfToday} to club sheet`);

    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.userCopyToAttendence = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
    const sheets = req.object.sheets;
    const clubRange = "Information";
    const incomingData = req.body;
    const sheetId = req.sheetId;
    const clubData = await sheetData(sheets, sheetId, clubRange);

    let copyUserValueForAttenence = [];
    for (let i = 0; clubData.length > i; i++) {
      if (i === 0) {
        copyUserValueForAttenence.push([
          clubData[i][0],
          clubData[i][1],
          clubData[i][2],
          clubData[i][3],
          clubData[i][4],
          clubData[i][5],
          clubData[i][6],
          clubData[i][7],
          "Status",
        ]);
        continue;
      }
      copyUserValueForAttenence.push([
        clubData[i][0],
        clubData[i][1],
        clubData[i][2],
        clubData[i][3],
        clubData[i][4],
        clubData[i][5],
        clubData[i][6],
        clubData[i][7],
        "absent",
      ]);
    }

    //maybe chnage addUserData to be name
    for (let i = 0; copyUserValueForAttenence.length >= i; i++) {
      await addUserData(
        sheets,
        sheetId,
        incomingData.dateOfToday,
        copyUserValueForAttenence[i]
      );
    }
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.totalMeeting = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
    const sheets = req.object.sheets;
    const clubRange = "Information";
    const sheetId = req.sheetId;
    const totalMeetingColumnFinder = await sheetColumnAlphabetFinder(
      sheets,
      sheetId,
      clubRange,
      "Total Meeting"
    );
    const totalMeetingRowFinder = await sheetRowNumberFinder(
      sheets,
      sheetId,
      clubRange,
      "Total Meeting",
      totalMeetingColumnFinder.columnNumber,
      false
    );
    const totalMeeting = await sheetData(
      sheets,
      sheetId,
      `${clubRange}!${totalMeetingColumnFinder.alphabet}${
        totalMeetingRowFinder + 1
      }`
    );

    const totalMeetingArray = JSON.parse(totalMeeting[0]);
    +totalMeetingArray.totalMeeting++;

    const totalMeetingString = JSON.stringify(totalMeetingArray);
    console.log(totalMeetingString);

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${clubRange}!${totalMeetingColumnFinder.alphabet}${
        totalMeetingRowFinder + 1
      }`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[totalMeetingString]],
      },
    });
  } catch (error) {
    console.log(error);
  }
};

//first
exports.generateQrCodeOnSheet = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
    const sheets = req.object.sheets;
    const clubRange = "clubData";
    const incomingData = req.body;

    let randomString = generateRandomString(10);
    console.log(randomString);

    await findAndUpdateValue(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      clubRange,
      "QR Code",
      "Club Code",
      incomingData.clubCode,
      randomString
    );
    req.randomString = randomString;
    return next();
  } catch (error) {
    console.log(error);
  }
};

//second
exports.generateQrCode = async (req, res, next) => {
  try {
    QRCode.toDataURL(
      req.randomString,
      { errorCorrectionLevel: "M" },
      function (error, url) {
        if (error) {
          console.error(error);
          res.json("backend error");
        }
        console.log(url);
        res.json(url);
      }
    );
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.getQrcode = async (req, next) => {
  try {
    const qrCode = req.body.qrCode;
  } catch (error) {
    console.log(error);
  }
};
