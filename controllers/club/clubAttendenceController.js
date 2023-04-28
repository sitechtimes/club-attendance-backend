"use strict";

require("dotenv").config({ path: "./env/spreadsheetId.env" });
const QRCode = require("qrcode");
//google spreadsheet id for "Main-Club-Data"
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
//google spreadsheet id for "User Data"

const {
  sheetData,
  getSheetNames,
  generateRandomString,
  updateValue,
  createNewSheetWithName,
  appendNewItemToRow,
  getOneData,
} = require("../../utility.js");

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
  try {
    const sheets = req.object.sheets;
    const clubRange = "Sheet1";
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
          "Row Number",
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
        `${i + 1}`,
      ]);
    }

    console.log(copyUserValueForAttenence);
    //maybe chnage addUserData to be name

    await appendNewItemToRow(
      sheets,
      sheetId,
      incomingData.dateOfToday,
      copyUserValueForAttenence
    );

    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.totalMeeting = async (req, res, next) => {
  console.log("running generateQRcode");
  try {
    const sheets = req.object.sheets;
    const sheetId = req.sheetId;

    const totalMeeting = await sheetData(sheets, sheetId, `Sheet1!J2`);

    const addMeeting = +totalMeeting + 1;

    await updateValue(sheets, sheetId, "Sheet1!J2", addMeeting);

    return next();
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

    let randomString = generateRandomString(10);
    console.log(randomString);

    await updateValue(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      `${clubRange}!L${req.clubData[16]}`,
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
  } catch (error) {
    console.log(error);
  }
};

exports.getQrcode = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const qrCode = req.body.club.qrCode;
    const clubName = req.body.club.clubName;

    const clubData = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      clubName,
      0
    );

    if (clubData[11] !== qrCode) {
      return res.json("Club qr code is wrong");
    }

    console.log(clubData[14]);
    req.spreadId = clubData[14];
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.markAttendence = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const sheetID = req.spreadId;
    const dateOfToday = req.body.dateOfToday;
    const userUid = req.body.user.uid;

    const userData = await getOneData(
      sheets,
      sheetID,
      `${dateOfToday}!A2:K`,
      userUid,
      0
    );

    console.log(dateOfToday, userUid, userData);

    await updateValue(
      sheets,
      sheetID,
      `${dateOfToday}!I${userData[9]}`,
      "present"
    );
    return res.json("Recorded attendence");
  } catch (error) {
    console.log(error);
  }
};
