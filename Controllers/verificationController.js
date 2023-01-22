const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

require("dotenv").config({ path: "variables.env" });
//google spreadsheet id for "Main-Club-Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const { sheetColumnAlphabetFinder, ifValueExist } = require("../utility.js");

exports.verifyByGmailMiddleware = async (req, res, next) => {
  try {
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

exports.verifyUser = async (req, res, next) => {
  try {
    console.log("running verifyingUser");
    console.log(req.body);
    if (req.body.user === null) {
      return res.json("User is not log in");
    }

    const uid = req.body.uid;
    const sheets = req.object.sheets;
    const range = "userData";

    const ifUserExist = await sheetColumnAlphabetFinder(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      range,
      "UID",
      uid
    ).then((res) => {
      return ifValueExist(
        sheets,
        USER_DATA_SPREADSHEET_ID,
        range,
        res.columnNumber,
        uid
      );
    });

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
