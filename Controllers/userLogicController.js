const { google } = require("googleapis");
require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const MAIN_CLUB_ID = `${process.env.MAIN_CLUB_DATA_ID}`;

const userDataSpreadSheetId = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

async function addUserData(sheet, userData, spreadsheetId) {
  let values = [
    [
      userData.sub,
      userData.given_name,
      userData.family_name,
      userData.email,
      userData.type,
      userData.hd,
      userData.positionOfClub,
    ],
  ];

  return Promise.resolve(
    await sheet.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "studentData",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    })
  );
}

function compareValue(spreadSheetValue, valueComparing) {
  let suchVale = true;
  for (let i = 0; spreadSheetValue.length > i; i++) {
    //the number zero need to be change to the data representing number
    //0 might return "Michael" for example
    let eachId = spreadSheetValue[i][0];

    if (eachId === valueComparing) {
      suchVale = false;
      break;
    }
  }
  return Promise.resolve(suchVale);
}

async function userDataExist(sheets, spreadsheetId, range) {
  const studentData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const credentialData = studentData.data.values;
  return credentialData;
  //make this a resuable function
  // compareValue(credentialData, userData.sub);
}

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
  //   console.log("rbjnklevjoinklj");
  //   console.log(user);

  const newUserDataObject = {
    uid: user[0],
    firstName: user[1],
    lastName: user[2],
    email: user[3],
    type: user[4],
    emailDomain: user[5],
    positionOfClub: JSON.parse(user[6]),
  };

  return Promise.resolve(newUserDataObject);
}

exports.checkUserData = async (req, res, next) => {
  try {
    const sheetsValue = req.object.sheets;

    if (req.userInfo.hd === "nycstudents.net") {
      console.log("student");

      // google sheet api range
      const range = "studentData";

      const ifUserExist = await userDataExist(
        sheetsValue,
        userDataSpreadSheetId,
        range
      ).then((response) =>
        compareValue(response, req.userInfo.sub).then(
          (compareValueResponse) => {
            return compareValueResponse;
          }
        )
      );

      //maybe this can be change into better fucntion
      //im sleepy
      if (!ifUserExist) {
        const user = await userDataExist(
          sheetsValue,
          userDataSpreadSheetId,
          range
        ).then((response) =>
          getUserData(response, req.userInfo.sub).then(
            (getUserDataeResponse) => {
              return getUserDataeResponse;
            }
          )
        );
        console.log(user);
        const response = user;
        console.log("user data exist");
        return res.json(response);
      }

      //here for create new user

      return next();
    } else if (userInfo.hd === "schools.nyc.gov") {
      console.log("teacher");
      req.userInfo.type = "teacher";
      // i think i will redirect this to the teacher route
      return res.json("teacher logic not finish");
    }
  } catch (error) {
    console.log(error);
    res.json(401);
  }
};

// const clubJoined = {
//   firstClub: "209ruopqiwjf",
// };
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

async function checkIfPresident(sheets, spreadsheetId, valueComparing) {
  const range = "Information";

  let response;
  await userDataExist(sheets, spreadsheetId, range).then(
    (userDataExistResponse) => {
      getEveryValue(userDataExistResponse, valueComparing).then(
        (compareValueResponse) => {
          response = compareValueResponse;
          return compareValueResponse;
        }
      );
    }
  );

  return response;
}

exports.createNewUser = async (req, res) => {
  const sheetsValue = req.object.sheets;
  try {
    console.log("user data did not exist");
    req.userInfo.type = "student";

    const ifPresident = await checkIfPresident(
      sheetsValue,
      MAIN_CLUB_ID,
      req.userInfo.sub
    ).then((response) => {
      return response;
    });

    if (ifPresident.length !== 0) {
      const presidentObject = [];

      ifPresident.forEach((array) => {
        console.log(array[8]);
        const object = {
          clubName: array[0],
          clubCode: array[11],
        };
        presidentObject.push(object);
      });

      console.log(presidentObject);

      req.userInfo.positionOfClub = JSON.stringify(presidentObject);
    } else {
      req.userInfo.positionOfClub = JSON.stringify([
        {
          position: "User is not a president of any club.",
        },
      ]);
    }
    console.log(req.userInfo);

    addUserData(sheetsValue, req.userInfo, userDataSpreadSheetId);
    console.log("user created");

    // let clubPostion;
    // if (req.userInfo.positionOfClub === "none") {
    //   clubPostion = req.userInfo.positionOfClub;
    // } else if (req.userInfo.positionOfClub !== "none") {
    //   clubPostion = JSON.parse(req.userInfo.positionOfClub);
    // }

    const response = {
      uid: req.userInfo.sub,
      firstName: req.userInfo.given_name,
      lastName: req.userInfo.family_name,
      email: req.userInfo.email,
      type: req.userInfo.type,
      emailDomain: req.userInfo.hd,
      positionOfClub: JSON.parse(req.userInfo.positionOfClub),
    };
    return res.json(response);
  } catch (error) {
    console.log(error);
  }
};

// exports.createNewUser = async (res, req) => {
//   console.log(req.userInfo);
//   try {
//     console.log(req.user);
//     console.log("user data did not exist");
//     req.userInfo.type = "student";

//     console.log(req.userInfo);

//     addUserData(req.userInfo);
//     const response = {
//       uid: req.userInfo.sub,
//       firstName: req.userInfo.given_name,
//       lastName: req.userInfo.family_name,
//       email: req.userInfo.email,
//       type: req.userInfo.type,
//       emailDomain: req.userInfo.hd,
//     };
//     return res.json(response);
//   } catch (error) {
//     console.log(error);
//   }
// };
