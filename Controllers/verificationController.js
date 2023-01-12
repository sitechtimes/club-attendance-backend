const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;

exports.verifyByGmailMiddleware = async (req, res, next) => {
  try {
    //  console.log(req.body);

    //this is the google crediental that is being sent over
    const incomingUserData = req.body.userCredential;

    //this function verfiy the access token generated from google login
    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    verifyToken(incomingUserData.access_token).then((userInfo) => {
      // console.log(userInfo);
      //set put userInfo into request called req.userInfo

      //this sets the decoded JWT token data to request
      req.userInfo = userInfo;
      //this sets the google domain
      req.userInfo.hd = incomingUserData.hd;

      //restricted to only school email
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
  } catch (error) {
    console.log(error);
  }
};

async function userDataExist(sheets, spreadsheetId, range) {
  const studentData = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
  });

  const credentialData = studentData.data.values;
  return credentialData;
}

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

exports.verifyUser = async (req, res, next) => {
  try {
    console.log(req.body);
    if (req.body.user === null) {
      return res.json("User is not log in");
    }

    const sheetsValue = req.object.sheets;
    console.log("verifyingUser");
    // google sheet api range
    const range = "userData";

    const ifUserExist = await userDataExist(
      sheetsValue,
      USER_DATA_SPREADSHEET_ID,
      range
    ).then((response) =>
      compareValue(response, req.body.user.uid).then((compareValueResponse) => {
        return compareValueResponse;
      })
    );

    if (ifUserExist === true) {
      console.log("User exist");
      return next();
    } else if (ifUserExist === false) {
      res.json("User does not exist");
    }
  } catch (error) {
    console.log(error);
  }
};
