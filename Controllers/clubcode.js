const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const UserData = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
const ClubCode = "FakeCode";
const UserID = "387465762846329623498";
// const { IDs } = await verifyToken(incomingUserData.accessToken);
// const incomingUserData = req.body.userCredential;

const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Compare the UserID to the values in column A of "UserData" sheet then add ClubCode into user's Club Code into column H 
exports.addClubCode = async (req, res) =>{
    try {
        const userDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: UserData,
            range: "userData!A1:A",
        });
        const userIDList = (userDataSheet).values;
        const listLength = userIDList?.length;
        console.log(listLength);
        console.log(userIDList);
        let rowNumber = 0;
        for (let i = 0; i < listLength; i++) {
            if (userIDList[i][0] === UserID) {
                rowNumber = i + 1;
                break;
                console.log(rowNumber);
            }
        }
        await google.sheets({ version: "v4", auth }).spreadsheets.values.update({
            spreadsheetId: UserData,
            range: `userData!H${rowNumber}`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[ClubCode]]
            },
        });
    } catch (error) {
        console.log(error);
    }
};

// Compare the ClubCode to the values in columne L of MainClubData sheet then get the sheetID(ClubData) of the club with the same ClubCode
exports.addUserDataToClub = async (req, res) =>{
    try {
        const mainClubDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: "Information!L1:L",
        });
        const clubCodeList = mainClubDataSheet.values;
        let ClubDataRowNumber = 0;
        for (let i = 0; i < clubCodeList.length; i++) {
            if (clubCodeList[i][0] === ClubCode) {
                ClubDataRowNumber = i + 1;
                break;
            }
        }
        const clubData = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: `Information!K${ClubDataRowNumber}`,
        });
        let ClubData = clubData.values[0][0];
        
        // In the ClubData sheet add First Name to column A, Last Name to column B, UserID to column C, and "Member" to column E
        google.sheets({ version: "v4", auth }).spreadsheets.values.append({
          spreadsheetId: ClubData,
          range: "Infomration!A1",
          valueInputOption: "USER_ENTERED",
          values: [['Hao Ran', 'Chen', '2487', 'Member']]
        });
    } catch (error) {
        console.log(error);
    }
};


