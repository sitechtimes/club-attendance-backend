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

exports.deleteMeeting = async (req, res) => {
  try {
    console.log(req.body, "body");
    console.log(req.body.clubName);
    const clubName = req.body.clubName;
    const dateToDelete = req.body.date;
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
    if (newMeetingList === meetingList) {
      newMeetingList = "No meeting date yet.";
    } else if (dateToDelete === meetingList.substring(0, `${deleteLength}`)) {
      newMeetingList = meetingList.replace(`${dateToDelete}, `, "");
    } else {
      newMeetingList = meetingList.replace(`, ${dateToDelete}`, "");
    }
    console.log(`${newMeetingList} newMeetingList`);

    if (newMeetingList === meetingList) {
      newMeetingList = "No meeting date yet.";
    }

    // Updates the sheet with the next list of meeting dates
    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: MainClubData,
      range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[newMeetingList]],
      },
    });
    res.json("Done deleting the meet.");
  } catch (error) {
    console.log(error);
  }
};
