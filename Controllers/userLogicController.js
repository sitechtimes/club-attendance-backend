//this file require the env package to get env variable
require("dotenv").config({ path: "./env/spreadsheetId.env" });
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const {
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
  sheetData,
  ifValueExist,
  addUserData,
  getUserData,
  findAndUpdateValue,
} = require("../utility.js");

exports.checkUserData = async (req, res, next) => {
  try {
    const range = "userData";
    const sheets = req.object.sheets;
    const findUidColumn = await sheetColumnAlphabetFinder(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range,
      "UID"
    );
    const ifUserExist = await ifValueExist(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range,
      findUidColumn.columnNumber,
      req.userInfo.sub
    );

    req.ifUserExist = ifUserExist;
    return next();
  } catch (error) {
    console.log(error);
  }
};

//need to use this function to check if user is exist
exports.sendBackUserData = async (req, res, next) => {
  try {
    // google sheet api range
    const range = "userData";
    const sheets = req.object.sheets;

    if (req.ifUserExist) {
      const user = await getUserData(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        range,
        req.userInfo.sub
      );
      console.log(user);
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

    req.userInfo.type = "student";
    req.userInfo.osis = "none";
    req.userInfo.grade = "none";
    req.userInfo.officalClass = "none";

    const columnUidFinder = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      "President's UID"
    );
    const rowUidNumber = await sheetRowNumberFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      req.userInfo.sub,
      columnUidFinder.columnNumber,
      true
    );
    const presidentArray = [];
    for (let i = 0; i < rowUidNumber.length; i++) {
      const data = await sheetData(
        sheets,
        CLUB_DATA_SPREADSHEET_ID,
        `clubData!${rowUidNumber[i]}:${rowUidNumber[i]}`
      );
      presidentArray.push(data[0]);
    }
    const clubCodeColumnNumber = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      "Club Code"
    );
    const clubNameColumnNumber = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      "clubData",
      "Club Name"
    );

    if (presidentArray.length !== 0) {
      const presidentObject = [];
      presidentArray.forEach((array) => {
        const object = {
          clubCode: array[clubCodeColumnNumber.columnNumber],
          position: "president",
          clubName: array[clubNameColumnNumber.columnNumber],
        };
        presidentObject.push(object);
      });
      console.log(presidentObject);
      req.userInfo.positionOfClub = JSON.stringify(presidentObject);
    } else {
      req.userInfo.positionOfClub = JSON.stringify([
        {
          clubStatus: "User have not join any club yet.",
        },
      ]);
    }

    console.log(req.userInfo);

    const value = [
      req.userInfo.sub,
      req.userInfo.given_name,
      req.userInfo.family_name,
      req.userInfo.email,
      req.userInfo.type,
      req.userInfo.osis,
      req.userInfo.grade,
      req.userInfo.officalClass,
      req.userInfo.hd,
      req.userInfo.positionOfClub,
    ];

    await addUserData(sheets, USER_DATA_SPREADSHEET_ID, "userData", value);

    const user = await getUserData(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      "userData",
      req.userInfo.sub
    );

    console.log("user created");
    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

//Additional Information(osis, grade, offical class)
exports.addOsisGradeOfficalClass = async (req, res) => {
  console.log("addOsisGradeOfficalClass");
  try {
    console.log(req.body);
    console.log(req.body.additionalInfoType);

    const sheets = req.object.sheets;
    const range = "userData";

    //do we really need function constructor?
    function ReturnResponse(status, type, value) {
      this.status = status;
      this.type = type;
      this.value = value;
    }

    await findAndUpdateValue(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range,
      req.body.additionalInfoType, //osis
      "UID",
      req.body.user.uid,
      req.body.additionalInfoValue
    );

    const response = new ReturnResponse(
      "Successful",
      req.body.additionalInfoType,
      req.body.additionalInfoValue
    );
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
