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

// Compare the UserID to the values in column A of "UserData" sheet then add ClubCode into user's Club Code on H 
const UserDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
    spreadsheetId: UserData,
    range: "userData!A1:A",
});
const UserIDList = UserDataSheet.data.values;
let rowNumber = 0;
for (let i = 0; i < UserIDList.length; i++) {
    if (UserIDList[i][0] === UserID) {
        rowNumber = i + 1;
        break;
    }
}
google.sheets({ version: "v4", auth }).spreadsheets.values.update({
    spreadsheetId: UserData,
    range: `userData!H${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    values: [[ClubCode]]
});

// Compare the ClubCode to the values in columne L of MainClubData sheet then get the sheetID(ClubData) of the club with the same ClubCode
const mainClubDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
    spreadsheetId: MainClubData,
    range: "Information!L1:L",
});
const clubCodeList = mainClubDataSheet.data.values;
let ClubDataRowNumber = 0;
for (let i = 0; i < clubCodeList.length; i++) {
    if (clubCodeList[i][0] === ClubCode) {
        ClubDataRowNumber = i + 1;
        break;
    }
}
const clubData = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
    spreadsheetId: MainClubData,
    range: `Information!K${ClubDataRowNumber}`,
});
let ClubData = clubData.data.values[0][0];

// In the ClubData sheet add First Name to column A, Last Name to column B, UID to column C, and "Member" to column E
google.sheets({ version: "v4", auth }).spreadsheets.values.append({
  spreadsheetId: ClubData,
  range: "Infomration!A1",
  valueInputOption: "USER_ENTERED",
  values: [['Hao Ran', 'Chen', '2487', 'Member']]
});
