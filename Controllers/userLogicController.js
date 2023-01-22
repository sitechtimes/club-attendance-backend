//this file require the env package to get env variable
require("dotenv").config({ path: "variables.env" });
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
} = require("../utility.js");

//this function compare two values one from the google sheet
//and another from user input
function compareValue(spreadSheetValue, valueComparing) {
  let suchVale = false;
  for (let i = 0; spreadSheetValue.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = spreadSheetValue[i][0];

    if (eachId === valueComparing) {
      suchVale = true;
      break;
    }
  }
  return Promise.resolve(suchVale);
}

//this function will return the user data from the google sheet called userdata
async function userDataExist(sheets, spreadsheetId, range) {
  const studentData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const credentialData = studentData.data.values;
  return credentialData;
}

//need to use this function to check if user is exist
exports.checkUserData = async (req, res, next) => {
  try {
    const sheetsValue = req.object.sheets;
    console.log("student");
    // google sheet api range
    const range = "userData";

    const ifUserExist = await userDataExist(
      sheetsValue,
      USER_DATA_SPREADSHEET_ID,
      range
    ).then((response) =>
      compareValue(response, req.userInfo.sub).then((compareValueResponse) => {
        return compareValueResponse;
      })
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
    const sheetsValue = req.object.sheets;

    if (req.ifUserExist) {
      const user = await userDataExist(
        sheetsValue,
        USER_DATA_SPREADSHEET_ID,
        range
      ).then((response) =>
        getUserData(response, req.userInfo.sub).then((getUserDataeResponse) => {
          return getUserDataeResponse;
        })
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

    await addUserData(sheets, USER_DATA_SPREADSHEET_ID, value);

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
exports.addOsisGradeOfficalClass = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(req.body.additionalInfoType);

    const sheetsValue = req.object.sheets;
    async function findAndUpdateValue(rowAlphabet) {
      await userDataExist(sheetsValue, USER_DATA_SPREADSHEET_ID, "userData")
        .then(async (response) => {
          console.log(response);
          let rowNumber = 0;

          for (let i = 0; response.length > i; i++) {
            //the number zero need to be change to the data representing number
            //0 might return "Michael" for example
            let eachId = response[i][0];
            rowNumber++;

            if (eachId === req.body.user.uid) {
              break;
            }
          }
          console.log(rowNumber);
          return rowNumber;
        })
        .then(async (number) => {
          await sheetsValue.spreadsheets.values.update({
            spreadsheetId: USER_DATA_SPREADSHEET_ID,
            range: `userData!${rowAlphabet}${number}`,
            valueInputOption: "USER_ENTERED",
            resource: {
              values: [[`${req.body.additionalInfoValue}`]],
            },
          });
        });
    }

    //do we really need function constructor?
    function ReturnResponse(status, type, value) {
      this.status = status;
      this.type = type;
      this.value = value;
    }

    if (req.body.additionalInfoType === "osis") {
      findAndUpdateValue("F");
      console.log("updated OSIS");
      const response = new ReturnResponse(
        "Successful",
        "osis",
        req.body.additionalInfoValue
      );
      return res.json(response);
    } else if (req.body.additionalInfoType === "officalClass") {
      findAndUpdateValue("H");
      console.log("updated offical class");
      const response = new ReturnResponse(
        "Successful",
        "officalClass",
        req.body.additionalInfoValue
      );
      return res.json(response);
    } else if (req.body.additionalInfoType === "grade") {
      findAndUpdateValue("G");
      console.log("updated grade");
      const response = new ReturnResponse(
        "Successful",
        "grade",
        req.body.additionalInfoValue
      );
      return res.json(response);
    } else {
      return res.json({
        response: "Unsucessfull",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.userInClub = async (req, res) => {
  try {
    const sheets = req.object.sheets;
    const range = "userData";
    const user = await userDataExist(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range
    ).then((response) =>
      getUserData(response, req.body.uid).then((getUserDataeResponse) => {
        return getUserDataeResponse;
      })
    );
    console.log(user);

    return res.json(user.positionOfClub);
  } catch (error) {
    console.log(error);
  }
};

exports.test = async (req, res) => {
  try {
    console.log("running test");
    const sheets = req.object.sheets;
    const range = "information";
    const user = await sheetColumnAlphabetFinder(
      sheets,
      CLUB_DATA_SPREADSHEET_ID,
      range,
      "Name"
    ).then((res) => {
      console.log(res);
      return ifValueExist(
        sheets,
        CLUB_DATA_SPREADSHEET_ID,
        range,
        res.columnNumber,
        "Jerry Chen"
      );
    });

    console.log(user);

    return res.json("hehhe");
  } catch (error) {
    console.log(error);
  }
};
