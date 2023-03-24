"use strict";
//this file require the env package to get env variable
require("dotenv").config({ path: "./env/spreadsheetId.env" });
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  sheetData,
  addData,
  getUserData,
  findAndUpdateValue,
  ifValueExistBinary,
} = require("../../utility.js");

//use this verfication for signing/loggin in
exports.ifUserExist = async (req, res, next) => {
  try {
    const userUidRange = "userData!A:A";
    const sheets = req.object.sheets;

    const ifUserExist = await ifValueExistBinary(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      userUidRange,
      req.userInfo.sub
    );

    req.ifUserExist = ifUserExist;
    return next();
  } catch (error) {
    console.log(error);
  }
};

//need to use this function to check if user is exist
exports.sendUserData = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    if (req.ifUserExist) {
      const user = await getUserData(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        "userData",
        req.userInfo.sub,
        0
      );
      console.log(user, "user");
      const response = user;
      console.log("user data exist");
      return res.json(response);
    }

    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.createNewUser = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    console.log("user data did not exist");

    req.userInfo.clientAuthority = "student";
    req.userInfo.osis = null;
    req.userInfo.grade = null;
    req.userInfo.officialClass = null;
    req.userInfo.clubData = null;
    req.userInfo.presentLocation = {
      inClubToday: false,
      club: null,
      roomNumber: null,
    };

    const userValuesObject = {
      uid: req.userInfo.sub,
      firstName: req.userInfo.given_name,
      lastName: req.userInfo.family_name,
      email: req.userInfo.email,
      clientAuthority: req.userInfo.clientAuthority,
      osis: req.userInfo.osis,
      grade: req.userInfo.grade,
      officialClass: req.userInfo.officialClass,
      emailDomain: req.userInfo.hd,
      clubData: req.userInfo.clubData,
      presentLocation: req.userInfo.presentLocation,
    };

    console.log(userValuesObject);
    res.json(userValuesObject);

    const rowNumber = await sheetData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData!L:L"
    ).then((row) => {
      let flatData = row.flat();

      if (flatData[flatData.length - 1] === "Row Number") {
        return 2;
      } else {
        let number = +flatData[flatData.length - 1] + 1;
        console.log(number);
        return number;
      }
    });

    req.userValues = [
      req.userInfo.sub,
      req.userInfo.given_name,
      req.userInfo.family_name,
      req.userInfo.email,
      req.userInfo.clientAuthority,
      JSON.stringify(req.userInfo.osis),
      JSON.stringify(req.userInfo.grade),
      JSON.stringify(req.userInfo.officialClass),
      req.userInfo.hd,
      JSON.stringify(req.userInfo.clubData),
      JSON.stringify(req.userInfo.presentLocation),
      rowNumber,
    ];

    return await addData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData",
      req.userValues
    );
  } catch (error) {
    console.log(error);
  }
};

//Additional Information(osis, grade, offical class)
exports.addOsisGradeOfficialClass = async (req, res) => {
  console.log("addOsisGradeOfficalClass");
  try {
    console.log(req.body);
    console.log(req.body.additionalInfoType);

    const sheets = req.object.sheets;
    const range = "userData";

    const user = await getUserData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData",
      req.body.user.uid,
      0
    );

    let columnAlphabet = null;
    if (req.body.additionalInfoType === "OSIS") {
      columnAlphabet = "F";
    } else if (req.body.additionalInfoType === "Grade") {
      columnAlphabet = "G";
    } else if (req.body.additionalInfoType === "Official Class") {
      columnAlphabet = "H";
    }

    await findAndUpdateValue(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range,
      user.rowNumber,
      columnAlphabet,
      req.body.additionalInfoValue
    );

    const response = {
      status: "Successful",
      type: req.body.additionalInfoType,
      value: req.body.additionalInfoValue,
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
  }
};

exports.test = async (req, res) => {
  try {
    console.log("running test");
    const sheets = req.object.sheets;

    const user = await sheets.spreadsheets.values.append({
      spreadsheetId: USER_DATA_SPREADSHEET_ID,
      range: `userData!E2`,
      includeValuesInResponse: true,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["`${inputValue}`"]],
      },
    });

    console.log(user);

    return res.json("hehhe");
  } catch (error) {
    console.log(error);
  }
};

exports.allUserData = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    const allUserData = await sheetData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData"
    );

    let sheetArray = [];

    //this is what change the array into object
    allUserData.forEach((element) => {
      const turnArrayToObject = Object.assign({}, element);
      sheetArray.push(turnArrayToObject);
    });

    //this will have a new array that rearrange the data into better
    //formatting
    sheetArray.shift();

    const sheetObject = sheetArray.map((value) => ({
      uid: value[0],
      firstName: value[1],
      lastName: value[2],
      email: value[3],
      type: value[4],
      osis: value[5],
      grade: value[6],
      officialClass: value[7],
      emailDomain: value[8],
      clubData: JSON.parse(value[9]),
      presentLocation: JSON.parse(value[10]),
    }));

    console.log(sheetObject);
    res.send(sheetObject);
  } catch (error) {
    console.log(error);
  }
};
