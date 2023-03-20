const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.deleteMeeting = async (req, res) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.clubName);
    // const clubName = req.body.clubName;
    const newMeeting = req.body.newMeeting;
    const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
    const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
    const clubName = "Chess Club";
    const dateToDelete = "04/29/2023";

    // This gets the rownumber of the Club
    const mainClubDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: "clubData!A2:A",
      });
    const clubNameList = mainClubDataSheet.data.values;
    const clubNamesLength = clubNameList?.length;
    console.log(clubNameList);
    console.log(clubNamesLength);
    let clubDataRowNumber = 0;
    for (let i = 0; i < clubNamesLength; i++) {
      if (clubNameList[i][0] === clubName) {
        clubDataRowNumber = i + 2;
        break;
      }
    }
    console.log(clubDataRowNumber);

    // This gets the list of meeting from the club
    const clubmeeting = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
      });
    let thisMeetingList = clubmeeting.data.values[0];
    let meetingList = `${thisMeetingList}`;
    console.log(meetingList);

    // This replaces the part in the meetingList that should be deleted with ""
    let newMeetingList = meetingList.replace(`${dateToDelete},`, "");

    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: MainClubData,
        range: `clubData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[newMeetingList]],
        },
      });

  } catch (error) {
    console.log(error);
  }
};