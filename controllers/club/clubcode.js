"use strict";
const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config({ path: "./env/spreadsheetId.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const UserData = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const ClubCode = "3TzWJPg";
const UserID = "104965533549487561020";
// const { IDs } = await verifyToken(incomingUserData.accessToken);
// const incomingUserData = req.body.userCredential;

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Compare the UserID to the values in column A of "UserData" sheet then add ClubCode into user's Club Code into column H
exports.addClubCode = async (req, res, next) => {
  try {
    const userDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: UserData,
        range: "userData!A2:A",
      });
    const userIDList = userDataSheet.data.values;
    const listLength = userIDList?.length;
    console.log(listLength);
    console.log(userIDList);
    let rowNumber = 0;
    for (let i = 0; i < listLength; i++) {
      if (userIDList[i][0] === UserID) {
        rowNumber = i + 2;
        break;
      }
    }
    console.log(rowNumber);
    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: UserData,
      range: `userData!K${rowNumber}:K${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[ClubCode]],
      },
    });
    return next();
  } catch (error) {
    console.log(error);
  }
};

// Compare the ClubCode to the values in columne L of MainClubData sheet then get the sheetID(ClubData) of the club with the same ClubCode
exports.addUserDataToClub = async (req, res) => {
  try {
    const mainClubDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: "Information!L2:L",
      });
    const clubCodeList = mainClubDataSheet.data.values;
    const clubCodesLength = clubCodeList?.length;
    console.log(clubCodeList);
    console.log(clubCodesLength);
    let clubDataRowNumber = 0;
    for (let i = 0; i < clubCodesLength; i++) {
      if (clubCodeList[i][0] === ClubCode) {
        clubDataRowNumber = i + 2;
        break;
      }
    }
    console.log(clubDataRowNumber);
    const clubData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `Information!K${clubDataRowNumber}:K${clubDataRowNumber}`,
      });
    let clubSheet = clubData.data.values[0][0];
    console.log(clubSheet);

    // In the ClubData sheet add First Name to column A, Last Name to column B, UserID to column C, and "Member" to column E
    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: clubSheet,
      range: "Information!A2:D2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["Hao Ran", "Chen", "2487", "Member"]],
      },
    });
  } catch (error) {
    console.log(error);
  }
};
