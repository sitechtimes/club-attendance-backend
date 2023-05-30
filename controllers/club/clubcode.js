"use strict";
const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const { getOneData, sheetData } = require("../../utility.js");

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.addUserDataToClub = async (req, res, next) => {
  try {
    const UserID = req.body.user.uid;
    const ClubCode = req.body.clubCode;
    const sheets = req.object.sheets;
    console.log(ClubCode);

    // This gets the clubDataRowNumber (what row the user's club is at on the main sheet)
    const clubDatas = await getOneData(
      sheets,
      MainClubData,
      "clubData",
      ClubCode,
      15
    );
    const clubDataRowNumber = clubDatas[16];
    console.log(clubDataRowNumber, "clubDataRowNumber");

    // This uses the row number to get the club's sheetid
    const clubSheetData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!N${clubDataRowNumber}:N${clubDataRowNumber}`,
      });
    let clubSheet = clubSheetData.data.values[0][0];
    console.log(clubSheet);

    // This gets the user's rownumber on the user data sheet
    const userDatas = await getOneData(
      sheets,
      userDataSheetID,
      "userData",
      UserID,
      0
    );
    const userRowNumber = userDatas[11].toString();
    console.log(userRowNumber, "userRowNumber");

    const userClubIDs = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: clubSheet,
        range: "sheet1!A1:A",
      });
    let clubIDs = userClubIDs.data.values.flat();
    // const userClubIDs = await sheetData(sheets, clubSheet, "A:A");
    console.log(clubIDs, "userClubIDs");
    console.log(UserID, "userID");
    console.log(clubIDs.includes(UserID), "Does User Exist Already");

    if (clubIDs.includes(UserID) === true) {
      res.json("Club Already Added");
    } else {
      // This gets the user's data from the user data sheet
      const clubData = await google
        .sheets({ version: "v4", auth })
        .spreadsheets.values.get({
          spreadsheetId: userDataSheetID,
          range: `A${userRowNumber}:H${userRowNumber}`,
        });
      let UID = clubData.data.values[0][0];
      let firstName = clubData.data.values[0][1];
      let lastName = clubData.data.values[0][2];
      let email = clubData.data.values[0][3];
      let OSIS = clubData.data.values[0][5];
      let grade = clubData.data.values[0][6];
      let offClass = clubData.data.values[0][7];
      console.log(clubData);
      console.log(UID);
      console.log(firstName);
      console.log(lastName);
      console.log(email);
      console.log(OSIS);
      console.log(grade);
      console.log(offClass);

      // Add user's data into the clubSheet (the club the user added)
      google.sheets({ version: "v4", auth }).spreadsheets.values.append({
        spreadsheetId: clubSheet,
        range: "Sheet1!A:H",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [UID, firstName, lastName, OSIS, `member`, grade, email, offClass],
          ],
        },
      });

      const specificClubIDs = await sheetData(sheets, clubSheet, "A:B");
      console.log(specificClubIDs, "specificClubIDs");
      const specificClubRowNumber = specificClubIDs.length + 1;
      console.log(specificClubIDs.length, "clublength");

      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: clubSheet,
        range: `J${specificClubRowNumber}:J${specificClubRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[specificClubRowNumber]],
        },
      });
      return specificClubRowNumber;
    }
    req.specificClubRowNumber = specificClubRowNumber;
    return next();
  } catch (error) {
    console.log(error);
  }
};

exports.updateUserClubs = async (req, res) => {
  try {
    const UserID = req.body.user.uid;
    const ClubCode = req.body.clubCode;
    const sheets = req.object.sheets;
    console.log(ClubCode);
    console.log(req.specificClubRowNumber);

    // This gets the clubDataRowNumber (what row the user's club is at on the main sheet)
    const clubDatas = await getOneData(
      sheets,
      MainClubData,
      "clubData",
      ClubCode,
      15
    );
    const clubDataRowNumber = clubDatas[16];
    console.log(clubDataRowNumber, "clubDataRowNumber 2");

    // This uses the row number to get the club's sheetid
    const clubSheetData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!N${clubDataRowNumber}:N${clubDataRowNumber}`,
      });
    let clubSheet = clubSheetData.data.values[0][0];
    console.log(clubSheet);

    const specificCLubUID = await getOneData(
      sheets,
      clubSheet,
      "Sheet1",
      UserID,
      0
    );
    console.log(specificCLubUID, "specificCLubUID");
    const specificClubRowNumber = specificCLubUID[9].toString();
    console.log(specificClubRowNumber, "specificClubRowNumber 2");

    // This gets the user's rownumber on the user data sheet
    const userDatas = await getOneData(
      sheets,
      userDataSheetID,
      "userData",
      UserID,
      0
    );
    const userRowNumber = userDatas[11].toString();
    console.log(userRowNumber, "userRowNumber 2");

    // get what clubs user is in
    const userWhatClubs = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: userDataSheetID,
        range: `userData!J${userRowNumber}:J${userRowNumber}`,
      });
    // this is needed, these are the console logs and the turn into oject
    const userClubList = userWhatClubs.data.values;
    console.log(`${userClubList} userClubList`);
    const clubString = JSON.stringify(userClubList);
    console.log(`${clubString} clubString`);
    // const hellome = JSON.stringify(clubObject);
    // console.log(hellome);

    // this gets the user's club's name
    const clubName = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `A${clubDataRowNumber}:A${clubDataRowNumber}`,
      });
    let userClubName = clubName.data.values[0];
    console.log(userClubName);

    // this gets the user's club posiiton in that specific club.
    const clubPosition = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: clubSheet,
        range: `E${specificClubRowNumber}:E${specificClubRowNumber}`,
      });
    let userClubPosition = clubPosition.data.values[0];
    console.log(userClubPosition);
    console.log(ClubCode);

    // This is the user's new club
    let newPosition = `{"clubCode":"${ClubCode}","position":"${userClubPosition}","clubName":"${userClubName}"}`;
    console.log(`${newPosition} newPosition`);

    let resJson;
    if (`${userClubList}`.includes(`${newPosition}`) === true) {
      resJson = "Club Already Exists";
    } else {
      resJson = newPosition;
    }
    const defaultClub = "null";

    let clubResponse = `[${newPosition}]`;
    console.log(`${userClubList}` === `${defaultClub}`);
    console.log(`${userClubList} userClubList`);
    console.log(`${defaultClub} defaultClub`);
    console.log(
      `${`${userClubList}`.includes(
        `${newPosition}`
      )} If userClubList includes newPosition`
    );
    if (`${userClubList}` === `${defaultClub}`) {
      // This is to change the "user got no club" to a real club.
      console.log("Step 1");
      clubResponse = `[${newPosition}]`;
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: userDataSheetID,
        range: `userData!J${userRowNumber}:J${userRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[clubResponse]],
        },
      });
      console.log(`${clubResponse} clubResponse`);
    } else if (`${userClubList}`.includes(`${newPosition}`) === true) {
      // This prevent users from adding the same club twice.
      console.log("Step 2");
      let clubResponse = `${userClubList}`;
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: userDataSheetID,
        range: `userData!J${userRowNumber}:J${userRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[clubResponse]],
        },
      });
    } else {
      // This is to add a new club to the list of clubs.
      const userClubListString = `${userClubList}`;
      let clubResponse = userClubListString.replace("]", `,${newPosition}]`);
      console.log(`${clubResponse} clubresponse step 3`);
      console.log(clubResponse.includes(newPosition));
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: userDataSheetID,
        range: `userData!J${userRowNumber}:J${userRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[clubResponse]],
        },
      });
    }
    res.json(resJson);
  } catch (error) {
    console.log(error);
  }
};
