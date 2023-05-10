const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const { parse } = require("dotenv");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });

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
    const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
    const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

    // This gets the list of every club's name
    const mainClubDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: "clubData!A2:A",
      });
    // clubNameList is the list of club names
    const clubNameList = mainClubDataSheet.data.values.flat();
    const clubSorted = clubNameList.sort();
    console.log(clubSorted);

    // This gets the row number of the club with a binary search, x is the club name
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
    // result would be the number in the array
    let result = binarySearch(clubSorted, x);
    // add 1 to get row number (google sheets don't start with 0)
    let clubDataRowNumber = result + 2;
    console.log(clubDataRowNumber);

    // This gets the list of meetings of that specific club
    const clubmeeting = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
      });
    let thisMeetingList = clubmeeting.data.values[0];
    let meetingList = `${thisMeetingList}`;
    console.log(`${meetingList} meetingList`);
    console.log(dateToDelete);

    // This replaces the part in the meetingList that should be deleted with "" (nothing)
    let deleteLength = dateToDelete.length;
    console.log(deleteLength);
    let newMeetingList;
    console.log(meetingList.substring(0, `${deleteLength}`));
    if (dateToDelete === meetingList.substring(0, `${deleteLength}`)) {
      newMeetingList = meetingList.replace(`${dateToDelete}, `, "");
    } else {
      newMeetingList = meetingList.replace(`, ${dateToDelete}`, "");
    }
    console.log(`${newMeetingList} newMeetingList`);

    // Updates the sheet with the next list of meeting dates
    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: MainClubData,
      range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[newMeetingList]],
      },
    });
  } catch (error) {
    console.log(error);
  }
};
