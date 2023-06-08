"use strict";
const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const { parse } = require("dotenv");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const {
  getOneData,
  getOneDataSpecial,
  sheetData,
} = require("../../utility.js");

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.removeClub = async (req, res) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.clubName);
    console.log(req.body.user.uid);
    const clubName = req.body.clubName;
    const UserID = req.body.user.uid;
    // const UserID = req.body.user.uid;
    const sheets = req.object.sheets;

    // This gets the clubDataRowNumber (what row the user's club is at on the main sheet)
    const clubDatas = await getOneData(
      sheets,
      MainClubData,
      "clubData",
      clubName,
      0
    );
    const clubDataRowNumber = clubDatas[17];
    console.log(clubDataRowNumber, "clubDataRowNumber");

    // This gets the user's rownumber on the user data sheet
    const userDatas = await getOneData(
      sheets,
      userDataSheetID,
      "userData",
      UserID,
      0
    );
    const userRowNumber = userDatas[11];
    console.log(userRowNumber, "userRowNumber");

    // This uses the row number to get the club's sheetid
    const userInfo = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: userDataSheetID,
        range: `userData!J${userRowNumber}:J${userRowNumber}`,
      });
    let userClubs = userInfo.data.values[0][0];
    console.log(userClubs, "userClubs");
    const arrayUserClubs = JSON.parse(userClubs);
    console.log(arrayUserClubs);

    const newArray = arrayUserClubs.filter(
      (club) => club.clubName !== clubName
    );
    console.log(newArray, "newArray");
    const newArrayString = JSON.stringify(newArray);

    let newUserInfo;
    if (newArrayString === "[]") {
      newUserInfo = "null";
    } else {
      newUserInfo = JSON.stringify(newArray);
    }
    console.log(newUserInfo, "newUserInfo");

    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: userDataSheetID,
      range: `userData!J${userRowNumber}:J${userRowNumber}`,
      valueInputOption: "RAW",
      resource: {
        values: [[newUserInfo]],
      },
    });

    // This uses the row number to get the club's sheetid
    const clubSheetData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!N${clubDataRowNumber}:N${clubDataRowNumber}`,
      });
    let clubSheet = clubSheetData.data.values[0][0];
    console.log(clubSheet);

    let UserIdString = UserID.toString();
    console.log(UserIdString, "UserIdString");
    const valueComparing = "1ThZUhPXNg4o-ZqV_JyRZ4HUlK641KiGVDVRx2QcEOvU";

    const specificClubUID = await getOneData(
      sheets,
      clubSheet,
      "Sheet1",
      UserID,
      0
    );
    console.log(specificClubUID, "specificClubUID");
    const specificClubRowNumber = specificClubUID[9].toString();
    console.log(specificClubRowNumber, "specificClubRowNumber 2");
    const nothing = "null";

    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: clubSheet,
      range: `Sheet1!A${specificClubRowNumber}:J${specificClubRowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
            nothing,
          ],
        ],
      },
    });
    res.json("Finish deleting");
  } catch (error) {
    console.log(error);
  }
};
