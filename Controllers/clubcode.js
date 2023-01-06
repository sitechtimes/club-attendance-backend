const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const UserData = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const ClubCode = "FakeCode";
const UserID = "114999107574796439138";
// const { IDs } = await verifyToken(incomingUserData.accessToken);
// const incomingUserData = req.body.userCredential;



const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });


// async function verifyToken(token) {
//     client.setCredentials({ access_token: token });
//     const userinfo = await client.request({
//       url: "https://www.googleapis.com/oauth2/v3/userinfo",
//     });
//     return userinfo.data;
// }

const IDs = await googleSheets.spreadsheets.values.get({
    auth,
    MainID,
    range: 'Information!L2:L',
});
