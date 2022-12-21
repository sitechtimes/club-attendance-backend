const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const { google } = require("googleapis");
const spreadsheetId = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.verifyemailMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const incomingUserData = req.body.userCredential;

    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    // this verfiy user token
    verifyToken(incomingUserData.access_token).then((userInfo) => {
      console.log(userInfo);
      //set put userInfo into request called req.userInfo

      req.userInfo = userInfo;
      req.userInfo.hd = incomingUserData.hd;

      if (
        userInfo &&
        (incomingUserData.hd === "nycstudents.net" ||
          incomingUserData.hd === "schools.nyc.gov")
      ) {
        return next();
      } else {
        // this else does not work
        console.log("User did not use school email");
        return res.json(
          "You must use a school email: nycstudents.net or schools.nyc.gov)"
        );
      }
    });
    // reminder to resict this to nycstudents domain
  } catch (error) {
    console.log(error);
  }
};

function addUserData(userData) {
  let sheet = google.sheets({ version: "v4", auth: client });
  let values = [
    [
      userData.sub,
      userData.given_name,
      userData.family_name,
      userData.email,
      userData.type,
      userData.hd,
    ],
  ];
  let resource = {
    values,
  };
  return Promise.resolve(
    sheet.spreadsheets.values.append(
      {
        auth,
        spreadsheetId,
        range: "studentData",
        resource,
        valueInputOption: "RAW",
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "User credentials successfully entered in Google Sheets."
          );
        }
      }
    )
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

async function userDataExist(sheets) {
  const studentData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "studentData",
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
  console.log("rbjnklevjoinklj");
  console.log(user);

  const newUserDataObject = {
    uid: user[0],
    firstName: user[1],
    lastName: user[2],
    email: user[3],
    type: user[4],
    emailDomain: user[5],
  };

  return Promise.resolve(newUserDataObject);
}

exports.checkUserData = async (req, res) => {
  try {
    const sheetsValue = req.object.sheets;

    if (req.userInfo.hd === "nycstudents.net") {
      console.log("student");

      const ifUserExist = await userDataExist(sheetsValue).then((response) =>
        compareValue(response, req.userInfo.sub).then(
          (compareValueResponse) => {
            return compareValueResponse;
          }
        )
      );

      //maybe this can be change into better fucntion
      //im sleepy
      if (!ifUserExist) {
        const user = await userDataExist(sheetsValue).then((response) =>
          getUserData(response, req.userInfo.sub).then(
            (getUserDataeResponse) => {
              return getUserDataeResponse;
            }
          )
        );
        const response = user;
        console.log("user data exist");
        return res.json(response);
      }

      console.log("user data did not exist");

      req.userInfo.type = "student";
      // console.log(req.userInfo);
      addUserData(req.userInfo);
      const response = {
        uid: req.userInfo.sub,
        firstName: req.userInfo.given_name,
        lastName: req.userInfo.family_name,
        email: req.userInfo.email,
        type: req.userInfo.type,
        emailDomain: req.userInfo.hd,
      };
      return res.json(response);
    } else if (userInfo.hd === "schools.nyc.gov") {
      console.log("teacher");
      req.userInfo.type = "teacher";

      return res.json("teacher logic not finish");
    }
  } catch (error) {
    console.log(error);
    res.json(401);
  }
};
