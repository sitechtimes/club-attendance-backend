"use strict";
const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1nxcHKJ2kuOy-aWS_nnBoyk4MEtAk6i1b-_pC_l_mx3g";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// // Compare the UserID to the values in column A of "UserData" sheet then add ClubCode into user's Club Code into column H
// exports.addClubCode = async (req, res, next) => {
//   try {
//     console.log(req.body);
//     const UserID = req.body.user.uid;
//     const ClubCode = req.body.clubCode;
//     // get all UIDs
//     const userDataSheet = await google
//       .sheets({ version: "v4", auth })
//       .spreadsheets.values.get({
//         spreadsheetId: userDataSheetID,
//         range: "userData!A2:A",
//       });
//     const userIDList = userDataSheet.data.values.flat();
//     const userIDSorted = userIDList.sort();
//     console.log(userIDSorted);

//     // This gets the row number of the club with a binary search, x is the club name
//     function binarySearch(userIDSorted, x) {
//       let l = 0,
//         r = userIDSorted.length - 1;
//       while (l <= r) {
//         let m = l + Math.floor((r - l) / 2);

//         let res = x.localeCompare(userIDSorted[m]);

//         // Check if x is present at mid
//         if (res == 0) return m;

//         // If x greater, ignore left half
//         if (res > 0) l = m + 1;
//         // If x is smaller, ignore right half
//         else r = m - 1;
//       }
//       return -1;
//     }
//     let x = UserID;
//     // result would be the number in the array
//     let result = binarySearch(userIDSorted, x);
//     // add 1 to get row number (google sheets don't start with 0)
//     let userRowNumber = result + 2;
//     console.log(userRowNumber);

//     google.sheets({ version: "v4", auth }).spreadsheets.values.update({
//       spreadsheetId: userDataSheetID,
//       range: `userData!K${userRowNumber}:K${userRowNumber}`,
//       valueInputOption: "USER_ENTERED",
//       resource: {
//         values: [[ClubCode]],
//       },
//     });
//     return next();
//   } catch (error) {
//     console.log(error);
//   }
// };

// Compare the ClubCode to the values in columne L of MainClubData sheet then get the sheetID(ClubData) of the club with the same ClubCode
exports.addUserDataToClub = async (req, res) => {
  try {
    const UserID = req.body.user.uid;
    const ClubCode = req.body.clubCode;
    // This gets the row number of the clubcode, this rownumber would "identify" the specific club, MainClubdata row#
    const mainClubDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: "clubData!P2:P",
      });
    const clubCodeList = mainClubDataSheet.data.values.flat();
    const clubCodeSorted = clubCodeList.sort();
    console.log(clubCodeSorted);

    // This gets the row number of the club with a binary search, x is the club name
    function binarySearch(clubCodeSorted, x) {
      let l = 0,
        r = clubCodeSorted.length - 1;
      while (l <= r) {
        let m = l + Math.floor((r - l) / 2);

        let res = x.localeCompare(clubCodeSorted[m]);

        // Check if x is present at mid
        if (res == 0) return m;

        // If x greater, ignore left half
        if (res > 0) l = m + 1;
        // If x is smaller, ignore right half
        else r = m - 1;
      }
      return -1;
    }
    let x = ClubCode;
    // result would be the number in the array
    let result = binarySearch(clubCodeSorted, x);
    // add 1 to get row number (google sheets don't start with 0)
    let clubDataRowNumber = result + 2;
    console.log(clubDataRowNumber);

    // This uses the row number to get the club's sheetid
    const clubSheetData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: MainClubData,
        range: `clubData!O${clubDataRowNumber}:O${clubDataRowNumber}`,
      });
    let clubSheet = clubSheetData.data.values[0][0];
    console.log(clubSheet);

    // This is same code as above to get user rowNumber, this could be used to get more User Info
    const userDataSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: userDataSheetID,
        range: "userData!A2:A",
      });
    // idk why but we need do this
    const userIDList = userDataSheet.data.values.flat();
    const userIDSorted = userIDList.sort();
    console.log(userIDSorted);

    // This gets the row number of the club with a binary search, x is the club name
    // function binarySearch(userIDSorted, y) {
    //   let l = 0,
    //     r = userIDSorted.length - 1;
    //   while (l <= r) {
    //     let m = l + Math.floor((r - l) / 2);

    //     let res = y.localeCompare(userIDSorted[m]);

    //     // Check if x is present at mid
    //     if (res == 0) return m;

    //     // If x greater, ignore left half
    //     if (res > 0) l = m + 1;
    //     // If x is smaller, ignore right half
    //     else r = m - 1;
    //   }
    //   return -1;
    // }
    let y = UserID;
    // result would be the number in the array
    let resultUser = binarySearch(userIDSorted, y);
    // add 1 to get row number (google sheets don't start with 0)
    let userRowNumber2 = resultUser + 2;
    console.log(userRowNumber2);

    // This uses the user row number to get the rest of the user data( A:UID, B:FName, C:LName, D:Email, F:OSIS, G:Grade, H:Off.Class)
    const clubData = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: userDataSheetID,
        range: `A${userRowNumber2}:H${userRowNumber2}`,
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

    // In the ClubData sheet add First Name to column A, Last Name to column B, UserID to column C, and "Member" to column E
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

    // This is used to get the row number of the user's data in their specific club
    const clubNameSheet = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: clubSheet,
        range: "Sheet1!A2:A",
      });
    const nameIDList = clubNameSheet.data.values.flat();
    const nameIDSorted = nameIDList.sort();
    console.log(nameIDSorted);

    // This gets the row number of the club with a binary search, x is the club name
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
    let v = UserID;
    // result would be the number in the array
    let resultID = binarySearch(nameIDSorted, x);
    // add 1 to get row number (google sheets don't start with 0)
    let specificClubRowNumber = resultID + 2;
    console.log(specificClubRowNumber);

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
        range: `userData!J${userRowNumber2}:J${userRowNumber2}`,
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
