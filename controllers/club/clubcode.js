"use strict";
const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const { getOneData } = require("../../utility.js");

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.addUserDataToClub = async (req, res) => {
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
        range: `clubData!O${clubDataRowNumber}:O${clubDataRowNumber}`,
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

    const specificClubDatas = await getOneData(
      sheets,
      clubSheet,
      "Sheet1",
      UserID,
      0
    );
    const specificClubRowNumber = specificClubDatas[16];
    console.log(specificClubDatas, "specificClubDataRowNumber");

    // // This is used to get the row number of the user's data in their specific club
    // const clubNameSheet = await google
    //   .sheets({ version: "v4", auth })
    //   .spreadsheets.values.get({
    //     spreadsheetId: clubSheet,
    //     range: "Sheet1!A2:A",
    //   });
    // const nameIDList = clubNameSheet.data.values.flat();
    // const nameIDSorted = nameIDList.sort();
    // console.log(nameIDSorted);

    // // This gets the row number of the club with a binary search, x is the club name
    // function binarySearch(nameIDSorted, v) {
    //   let l = 0,
    //     r = nameIDSorted.length - 1;
    //   while (l <= r) {
    //     let m = l + Math.floor((r - l) / 2);

    //     let res = v.localeCompare(nameIDSorted[m]);

    //     // Check if x is present at mid
    //     if (res == 0) return m;

    //     // If x greater, ignore left half
    //     if (res > 0) l = m + 1;
    //     // If x is smaller, ignore right half
    //     else r = m - 1;
    //   }
    //   return -1;
    // }
    // let v = UserID;
    // // result would be the number in the array
    // let resultID = binarySearch(nameIDSorted, v);
    // // add 1 to get row number (google sheets don't start with 0)
    // let specificClubRowNumber = resultID + 2;
    // console.log(specificClubRowNumber, "specificClubRowNumber");

    google.sheets({ version: "v4", auth }).spreadsheets.values.update({
      spreadsheetId: clubSheet,
      range: `K${specificClubRowNumber}:K${specificClubRowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[specificClubRowNumber]],
      },
    });

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

    if (`${userClubList}`.includes(`${newPosition}`) === true) {
      res.json(`club already exists`);
    } else {
      res.json(newPosition);
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
        range: `userData!J${userRowNumber2}:J${userRowNumber2}`,
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
        range: `userData!J${userRowNumber2}:J${userRowNumber2}`,
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
        range: `userData!J${userRowNumber2}:J${userRowNumber2}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[clubResponse]],
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
