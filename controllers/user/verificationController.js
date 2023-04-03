"use strict";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config({ path: "./env/spreadsheetId.env" });
//google spreadsheet id for "Main-Club-Data"
const USER_DATA_SPREADSHEET_ID = `${process.env.USER_DATA_SPREADSHEET_ID}`;
const { ifValueExistBinary } = require("../../utility.js");

exports.gmailVerification = async (req, res, next) => {
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

    await verifyToken(incomingUserData.access_token).then((userInfo) => {
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

//use this verfication for actions they do
exports.verifyUserInDb = async (req, res, next) => {
  try {
    console.log("running verifyingUser");
    console.log(req.body);

    if (req.body.user === null) {
      return res.json("User is not log in");
    }

    const uid = req.body.user.uid;
    const sheets = req.object.sheets;

    console.log(uid);

    //userData!A:A refers to uid
    const ifUserExist = await ifValueExistBinary(
      sheets,
      USER_DATA_SPREADSHEET_ID,
      `userData!A:A`,
      uid
    );

    console.log(ifUserExist);

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
