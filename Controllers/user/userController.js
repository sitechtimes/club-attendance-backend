"use strict";
//this file require the env package to get env variable
require("dotenv").config();
//google spreadsheet id for "Main-Club-Data"

//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const NEW_CLUB_DATA_SPREADSHEETID = `${process.env.NEW_CLUB_DATA_SPREADSHEETID}`;
const {
  sheetData,
  addData,
  getOneData,
  ifValueExistBinary,
  updateValue,
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

exports.alreadyLogin = async (req, res, next) => {
  try {
    const userUidRange = "userData!A:A";
    const sheets = req.object.sheets;

    const ifUserExist = await ifValueExistBinary(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      userUidRange,
      req.body.uid
    );

    req.ifUserExist = ifUserExist;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.sendLoginData = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    if (req.ifUserExist) {
      const userArray = await getOneData(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        "userData",
        req.body.uid,
        0
      );

      let userClubData = JSON.parse(userArray[9]);

      if (userClubData !== null) {
        for (let i = 0; userClubData.length > i; i++) {
          const inThatClub = await getOneData(
            sheets,
            NEW_CLUB_DATA_SPREADSHEETID,
            "clubData",
            userClubData[i].clubCode,
            15
          );
          let dates = [];
          dates.push(inThatClub[10]);
          function separateDates(dateArray) {
            // Extract the string from the array
            let dateString = dateArray[0];

            // Split the string by commas and trim any whitespace
            let dates = dateString.split(",").map((date) => date.trim());
            return dates;
          }
          const date = separateDates(dates);
          userClubData[i].meetingDates = date;
          userClubData[i].clubDescription = inThatClub[16];
        }
      }

      const userObject = {
        uid: userArray[0],
        firstName: userArray[1],
        lastName: userArray[2],
        email: userArray[3],
        clientAuthority: userArray[4],
        osis: JSON.parse(userArray[5]),
        grade: JSON.parse(userArray[6]),
        officialClass: userArray[7],
        emailDomain: userArray[8],
        clubData: userClubData,
        presentLocation: JSON.parse(userArray[10]),
        rowNumber: userArray[11],
      };
      console.log(userObject, "user");
      const response = userObject;
      console.log("vdklnvlkdnvlkdnslvvdsknlkdnsv");
      return res.json(response);
    }
  } catch (error) {
    console.log(error);
  }
};

//need to use this function to check if user is exist
exports.sendUserData = async (req, res, next) => {
  try {
    const sheets = req.object.sheets;

    if (req.ifUserExist) {
      const userArray = await getOneData(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        "userData",
        req.userInfo.sub,
        0
      );

      let userClubData = JSON.parse(userArray[9]);

      if (userClubData !== null) {
        for (let i = 0; userClubData.length > i; i++) {
          const inThatClub = await getOneData(
            sheets,
            NEW_CLUB_DATA_SPREADSHEETID,
            "clubData",
            userClubData[i].clubCode,
            15
          );
          let dates = [];
          dates.push(inThatClub[10]);
          function separateDates(dateArray) {
            // Extract the string from the array
            let dateString = dateArray[0];

            // Split the string by commas and trim any whitespace
            let dates = dateString.split(",").map((date) => date.trim());
            return dates;
          }
          const date = separateDates(dates);
          userClubData[i].meetingDates = date;
          userClubData[i].clubDescription = inThatClub[16];
        }
      }

      const userObject = {
        uid: userArray[0],
        firstName: userArray[1],
        lastName: userArray[2],
        email: userArray[3],
        clientAuthority: userArray[4],
        osis: JSON.parse(userArray[5]),
        grade: JSON.parse(userArray[6]),
        officialClass: userArray[7],
        emailDomain: userArray[8],
        clubData: userClubData,
        presentLocation: JSON.parse(userArray[10]),
        rowNumber: userArray[11],
      };
      console.log(userObject, "user");
      const response = userObject;
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
  try {
    console.log(req.body.additionalInfoType);

    const sheets = req.object.sheets;
    const userData = "userData";

    const userArray = await getOneData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      userData,
      req.body.user.uid,
      0
    );

    const userObject = {
      rowNumber: userArray[11],
    };

    let columnAlphabet = null;
    if (req.body.additionalInfoType === "OSIS") {
      columnAlphabet = "F";
    } else if (req.body.additionalInfoType === "Grade") {
      columnAlphabet = "G";
    } else if (req.body.additionalInfoType === "Official Class") {
      columnAlphabet = "H";
      req.body.additionalInfoValue = req.body.additionalInfoValue.toUpperCase();
    }
    console.log(userObject.rowNumber);
    await updateValue(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      `${userData}!${columnAlphabet}${userObject.rowNumber}`,
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
