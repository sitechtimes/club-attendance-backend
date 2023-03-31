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

exports.allUserMeeting = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

exports.newMeeting = async (req, res, next) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.clubName);
    const clubName = req.body.clubName;
    const newMeeting = req.body.newMeeting;
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

    const clubmeeting = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
      });
    let thisMeetingList = clubmeeting.data.values;
    let meetingList = `${thisMeetingList}`;

    // This is the res.json aprt that sends data back to frontend
    if (`${meetingList}`.includes(`${newMeeting}`) === true) {
      res.json(`Meeting already exist`);
    } else {
      let responseBack = {
        newMeeting: `${newMeeting}`,
        clubName: `${clubName}`,
      };
      res.json(responseBack);
    }

    const meetingDefault = `null`;
    if (`${meetingList}` === `${meetingDefault}`) {
      // This is to change the "user got no club" to a real club.
      console.log("Step 1");
      meetingResponse = newMeeting;
      console.log(meetingResponse);
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: MainClubData,
        range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[meetingResponse]],
        },
      });
      console.log(`${meetingResponse} meetingResponse`);
    } else if (`${meetingList}`.includes(`${newMeeting}`) === true) {
      // This prevent users from adding the same club twice.
      console.log("Step 2");
      let meetingResponse = meetingList;
      console.log(meetingResponse);
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: MainClubData,
        range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[meetingResponse]],
        },
      });
    } else {
      // This is to add a new meeting to the list of meetings.
      const meetingListString = `${meetingList}`;
      let meetingResponse = meetingListString.concat(`, ${newMeeting}`);
      console.log(`${meetingResponse} meetingresponse step 3`);
      console.log(meetingResponse.includes(newMeeting));
      google.sheets({ version: "v4", auth }).spreadsheets.values.update({
        spreadsheetId: MainClubData,
        range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[meetingResponse]],
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
