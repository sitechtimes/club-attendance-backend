require("dotenv").config({ path: "variables.env" });

//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
const {
  sheetColumnAlphabetFinder,
  ifValueExist,
  sheetData,
} = require("../utility.js");

//this lets us read all the data from main spreadsheet
exports.allClubData = async (req, res) => {
  try {
    const sheets = req.object.sheets;

    const allClubData = await sheetData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData"
    );

    console.log(allClubData);

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
      advisorEmail: value[2],
      president: value[3],
      presidentEmail: value[4],
      presidentUID: value[5],
      roomNumber: value[6],
      memberCount: value[7],
      nextMeeting: value[8],
      qrCode: value[9],
      clubSpreadsheetId: value[10],
      clubCode: value[11],
    }));
    sheetObject.shift();

    console.log(sheetObject);
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
    const userClubCode = req.body; //this is the data from the frontend

    //this specific which google spreadsheet we are acessing
    const clubRange = "clubData";

    const clubCodeFinder = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      clubRange,
      "Club Code"
    );
    const clubSheetIdFinder = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      clubRange,
      "Own Sheet ID"
    );
    const ifClubExist = await ifValueExist(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      clubRange,
      clubCodeFinder.columnNumber,
      userClubCode.clubCode
    );
    console.log(ifClubExist);

    if (ifClubExist === false) {
      console.log("no such club");
      return res.json("no such club");
    }

    console.log(clubCodeFinder.alphabet, clubSheetIdFinder.alphabet);
    req.clubCodeAlphabet = clubCodeFinder.alphabet;
    req.clubSheetIdAlphabet = clubSheetIdFinder.alphabet;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.returnSheetId = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;
    const userClubCode = req.body;

    const clubRange = "clubData";
    const clubSheetIdAndClubCode = await sheetData(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      `${clubRange}!${req.clubCodeAlphabet}:${req.clubSheetIdAlphabet}`
    );

    console.log(clubSheetIdAndClubCode);

    //this variable will be needed to access the specific club google spreadsheet id
    let idOfSheet = null;

    //this compare the incoming club code to google spreadsheet club code
    for (let i = 0; clubSheetIdAndClubCode.length > i; i++) {
      let eachClubCode = clubSheetIdAndClubCode[i][1];
      console.log(eachClubCode);
      if (eachClubCode === userClubCode.clubCode) {
        idOfSheet = clubSheetIdAndClubCode[i][0];
      }
    }

    if (idOfSheet === null) {
      console.log("idOfSheet is null");
      return res.json("Backend error: compareClubCodeMiddleware ");
    }
    req.sheetId = idOfSheet;
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

    const clubData = await sheetData(sheets, req.sheetId, "Information");

    let sheetArray = [];

    //this is what change the array into object
    clubData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting

    const sheetObject = sheetArray.map((value) => ({
      firstName: value[0],
      lastName: value[1],
      uid: value[2],
      osis: value[3],
      position: value[4],
      grade: value[5],
      email: value[6],
      officalClass: value[7],
      numbOfAttendence: value[8],
      numbOfAbsent: value[9],
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
