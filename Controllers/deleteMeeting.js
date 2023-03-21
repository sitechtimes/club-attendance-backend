const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const { parse } = require("dotenv");
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
    const clubName = req.body.clubName;
    const dateToDelete = req.body.newMeeting;
    const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
    const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

    // This gets the rownumber of the Club
    const mainClubDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: "clubData!A2:A",
      });
    const clubNameList = mainClubDataSheet.data.values.flat();
    const clubNamesLength = clubNameList.length;
    const clubSorted = clubNameList.sort();
    console.log(clubNameList);
    console.log(clubNamesLength);

    function binarySearch(clubSorted, x) {
      let l = 0,
        r = clubSorted.length - 1;
      while (l <= r) {
        let m = l + Math.floor((r - l) / 2);

        let res = x.localeCompare(clubSorted[m]);

        // Check if x is present at mid
        if (res == 0) return m;

        // If x greater, ignore left half
        if (res > 0) l = m + 1;
        // If x is smaller, ignore right half
        else r = m - 1;
      }
      return -1;
    }
    let x = clubName;
    let result = binarySearch(clubSorted, x);
    let clubDataRowNumber = 0;
    if (result == -1) console.log("Element not present<br>");
    else let clubDataRowNumber = result + 1;

    // let clubDataRowNumber = 0;
    // for (let i = 0; i < clubNamesLength; i++) {
    //   if (clubNameList[i][0] === clubName) {
    //     clubDataRowNumber = i + 2;
    //     break;
    //   }
    // }
    // console.log(clubDataRowNumber);

    // This gets the list of meeting from the club
    const clubmeeting = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
      });
    let thisMeetingList = clubmeeting.data.values[0];
    let meetingList = `${thisMeetingList}`;
    console.log(`${meetingList} meetingList`);
    console.log(dateToDelete);

    // This replaces the part in the meetingList that should be deleted with ""
    let newMeetingList = meetingList.replace(`${dateToDelete}, `, "");
    console.log(newMeetingList);

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
