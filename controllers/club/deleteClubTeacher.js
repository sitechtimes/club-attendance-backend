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
const { getOneData, sheetData } = require("../../utility.js");


const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});


exports.removeClub = async (req, res) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.currentClubCode);
    console.log(req.body.goneOsis);
    const clubCode = req.body.currentClubCode;
    const OSIS = req.body.goneOsis;
    const sheets = req.object.sheets;


    // This gets the clubDataRowNumber (what row the user's club is at on the main sheet)
    const clubDatas = await getOneData(
      sheets,
      MainClubData,
      "clubData",
      clubCode,
      15
    );
    const clubDataRowNumber = clubDatas[17];
    console.log(clubDataRowNumber, "clubDataRowNumber");

    // This gets the user's rownumber on the user data sheet
    const userDatas = await getOneData(
        sheets,
        userDataSheetID,
        "userData",
        OSIS,
        5
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

    const newArray = arrayUserClubs.filter((club) => club.clubCode !== clubCode);
    console.log(newArray);
    const newUserInfo = JSON.stringify(newArray);
    console.log(newUserInfo);
    
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

    const specificClubUID = await getOneData(
      sheets,
      clubSheet,
      "Sheet1",
      OSIS,
      3
    );
    console.log(specificClubUID, "specificClubUID");
    const specificClubRowNumber = specificClubUID[9].toString();
    console.log(specificClubRowNumber, "specificClubRowNumber 2");
    const specificClubIndex = specificClubRowNumber - 1;
    const nothing = "";

    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: clubSheet,
        range: `Sheet1!A${specificClubRowNumber}:J${specificClubRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[nothing, nothing, nothing, nothing, nothing, nothing, nothing, nothing, nothing, nothing]],
        },
    });
  } catch (error) {
    console.log(error);
  }
};


