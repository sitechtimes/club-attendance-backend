"use strict";

require("dotenv").config();
const QRCode = require("qrcode");
//google spreadsheet id for "Main-Club-Data"
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;

const {
  sheetData,
  getSheetNames,
  updateValue,
  createNewSheetWithName,
  appendNewItemToRow,
  getOneData,
  generateRandomNumber,
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

    return next();
  } catch (error) {
    console.log(error);
    res.json(`Attendence of ${req.body.dateOfToday} is already created.`);
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
  try {
    const sheets = req.object.sheets;
    const sheetId = req.sheetId;

    const totalMeeting = await sheetData(sheets, sheetId, `Sheet1!K1`);

    const addMeeting = +totalMeeting + 1;

    await updateValue(sheets, sheetId, "Sheet1!K1", addMeeting);

    return next();
  } catch (error) {
    console.log(error);
  }
};

//first
exports.generateQrCodeOnSheet = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const clubRange = "clubData";

    let randomString = generateRandomNumber(10);

    await updateValue(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      `${clubRange}!L${req.clubData[17]}`,
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
    const qrCode = req.body.qrCode;

    const clubData = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      qrCode,
      11
    );

    req.clubData = clubData;
    req.spreadId = clubData[13];
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

    console.log(sheetID, dateOfToday, userUid);

    const userData = await getOneData(
      sheets,
      sheetID,
      `${dateOfToday}!A2:K`,
      userUid,
      0
    );

    console.log(userData, "ndjvdsklnv");

    await updateValue(
      sheets,
      sheetID,
      `${dateOfToday}!I${userData[9]}`,
      "present"
    );
    return next();
  } catch (error) {
    console.log(error);
    res.json("Wrong QR Code!");
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userArray = await getOneData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData",
      req.body.user.uid,
      0
    );

    let updateLocation = JSON.parse(userArray[10]);
    updateLocation.inClubToday = true;
    updateLocation.club = `${req.clubData[0]}`;
    updateLocation.roomNumber = `${req.clubData[5]}`;

    const stringLocation = JSON.stringify(updateLocation);

    await updateValue(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      `userData!K${userArray[11]}`,
      stringLocation
    );
    res.json("Recorded attendence");

    async function clearLocation() {
      updateLocation.inClubToday = false;
      updateLocation.club = null;
      updateLocation.roomNumber = null;

      const stringLocation = JSON.stringify(updateLocation);

      await updateValue(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        `userData!K${userArray[11]}`,
        stringLocation
      );
    }

    return setTimeout(clearLocation, 7200000);
  } catch (error) {
    console.log(error);
  }
};

// send back all meeting date
// able to create meeting for that date or manually select present or absent

exports.manuallyPresentAbsent = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const clubName = req.body.clubName;

    const clubData = await getOneData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      clubName,
      0
    );

    req.spreadId = clubData[14];
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.manuallyPresentAbsent2 = async (req, res, next) => {
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

    await updateValue(
      sheets,
      sheetID,
      `${dateOfToday}!I${userData[9]}`,
      `${req.body.status}`
    );
    return res.json("Recorded attendence");
  } catch (error) {
    console.log(error);
  }
};
