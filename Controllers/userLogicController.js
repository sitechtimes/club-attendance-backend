//this file require the env package to get env variable
require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const CLUB_DATA_SPREADSHEET_ID = `${process.env.CLUB_DATA_SPREADSHEET_ID}`;
//google spreadsheet id for "User Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const {
  sheetColumnAlphabetFinder,
  sheetRowNumberFinder,
} = require("../utility.js");

//this function add user to google, which takes three
// parameter: sheet, which is sheet id from req.obect from
//verficationMiddleware
//user data that was pass through after google auth verifcation
//spreadsheetid is from the url id from google sheets
async function addUserData(sheet, userData, spreadsheetId) {
  //this is the value we are going to add to google sheets
  let values = [
    [
      userData.sub,
      userData.given_name,
      userData.family_name,
      userData.email,
      userData.type,
      userData.osis,
      userData.grade,
      userData.officalClass,
      userData.hd,
      userData.positionOfClub,
    ],
  ];

  return Promise.resolve(
    await sheet.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "userData",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    })
  );
}

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

//this function get user data from "User Data" google sheet
function getUserData(spreadSheetValue, valueComparing) {
  let user = null;
  for (let i = 0; spreadSheetValue.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = spreadSheetValue[i][0];

    if (eachId === valueComparing) {
      user = spreadSheetValue[i];
      break;
    }
  }

  const newUserDataObject = {
    uid: user[0],
    firstName: user[1],
    lastName: user[2],
    email: user[3],
    type: user[4],
    osis: user[5],
    grade: user[6],
    officalClass: user[7],
    emailDomain: user[8],
    positionOfClub: JSON.parse(user[9]),
  };

  return Promise.resolve(newUserDataObject);
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

function getEveryValue(spreadSheetValue, valueComparing) {
  let eachClubPostion = [];
  for (let i = 0; spreadSheetValue.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = spreadSheetValue[i][5];

    if (eachId === valueComparing) {
      eachClubPostion.push(spreadSheetValue[i]);
    }
  }
  return Promise.resolve(eachClubPostion);
}

async function checkIfPresident(sheets, spreadsheetId, valueComparing, range) {
  const response = await userDataExist(sheets, spreadsheetId, range).then(
    async (userDataExistResponse) => {
      const compareValueResponse = await getEveryValue(
        userDataExistResponse,
        valueComparing
      );
      return compareValueResponse;
    }
  );

  return response;
}

exports.createNewUser = async (req, res) => {
  const sheetsValue = req.object.sheets;
  try {
    console.log("user data did not exist");

    req.userInfo.type = "student";
    req.userInfo.osis = "none";
    req.userInfo.grade = "none";
    req.userInfo.officalClass = "none";

    const ifPresident = await checkIfPresident(
      sheetsValue,
      CLUB_DATA_SPREADSHEET_ID,
      req.userInfo.sub,
      "Information"
    ).then((response) => {
      return response;
    });

    if (ifPresident.length !== 0) {
      const presidentObject = [];

      ifPresident.forEach((array) => {
        console.log(array[8]);
        const object = {
          clubCode: array[11],
          postion: "president",
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

    const response = await addUserData(
      sheetsValue,
      req.userInfo,
      USER_DATA_SPREADSHEET_ID
    ).then(async () => {
      return await userDataExist(
        sheetsValue,
        USER_DATA_SPREADSHEET_ID,
        "userData"
      ).then((response) =>
        getUserData(response, req.userInfo.sub).then((getUserDataeResponse) => {
          return getUserDataeResponse;
        })
      );
    });

    console.log("user created");
    return res.json(response);
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

exports.test = async (req, res) => {
  try {
    const sheetsValue = req.object.sheets;
    const userDataRange = "userData";
    await sheetRowNumberFinder(
      sheetsValue,
      USER_DATA_SPREADSHEET_ID,
      userDataRange,
      "101233693992321242090"
    );
  } catch (error) {
    console.log(error);
  }
};
