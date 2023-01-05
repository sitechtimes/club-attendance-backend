const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const UserData = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const ClubCode = "FakeCode";
const UserID = "114999107574796439138";
// const { IDs } = await verifyToken(incomingUserData.accessToken);
// const incomingUserData = req.body.userCredential;



// const auth = new google.auth.GoogleAuth({
//     keyFile: "keys.json",
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });


// async function verifyToken(token) {
//     client.setCredentials({ access_token: token });
//     const userinfo = await client.request({
//       url: "https://www.googleapis.com/oauth2/v3/userinfo",
//     });
//     return userinfo.data;
// }

// this compares the user's id to the various ids on "UserData" 
if (data.sub === UserID) {
    const { IDs } = await googleSheets.spreadsheets.values.get({
        auth,
        UserData,
        range: "A1:A",
    });
    const values = IDs.values;
    let rowNum;
    for(let i = 0; i < values.length; i++) {
        if (values[i] === UserID) {
            rowNum = i + 1;
            break;
        }
    }
    const { IDs } = await googleSheets.spreadsheets.values.update({
        auth,
        UserData,
        range: `H${rowNum}:H${rowNum}`,
        valueInputOption: "USER_ENTERED",
        values: [[ClubCode]],
    });
}

const Codes = await googleSheets.spreadsheets.values.get({
    auth,
    MainID,
    range: 'Information!L2:L',
});

const users = await googleSheets.spreadsheets.values.get({
    auth,
    UserData,
    range: 'UserData!L2:L',
});

let ClubSheet;

for (let i = 0; i < Codes.data.values.length; i++) {
    const clubcell = Codes.data.values[i];
    if (clubcell[0] === ClubCode) {
        ClubSheet = clubcell[1];
    }
}

for (let i = 0; i < users.data.values.length; i++) {
    const usercell = users.data.values[i];
    if (usercell[0] === UserID) {
        usercell[1] = ClubCode;
    }
}

await googleSheets.spreadsheets.values.update({
    auth,
    UserData,
    range: 'UserData!H2',
    valueInputOption: "USER_ENTERED",
    resource: {
        values: [
            [UserID, ClubCode],
        ]
    },
});

return ClubSheet;


async function modifySpreadsheet(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = await sheets.spreadsheets.values.get({
    spreadsheetId: MainClubData,
    range: "L:L",
    }).then(({ data }) => {
    const row = data.values.findIndex(
    (value) => value[0] === ClubCode
    );
    if (row === -1) {
    return;
    }
    const sheetId = data.values[row][1];
    sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "A:A",
    valueInputOption: "USER_ENTERED",
    resource: {
    values: [
    [UserID, incomingUserData],
    ],
    },
    }).then(() => console.log("Data appended into spreadsheet"));
    });
    }
    
    modifySpreadsheet(auth);