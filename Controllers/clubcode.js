const express = require("express");
const { google } = require("googleapis");
const { OAuth2Client, AuthClient } = require("google-auth-library");
const { osconfig } = require("googleapis/build/src/apis/osconfig");
const client = new OAuth2Client();
require("dotenv").config({ path: "variables.env" });
const MainClubData = "1Xm649d7suBlRVjXJeH31k4mAq3NLFV8pW_8QrJ55QpU";
const userDataSheetID = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
// const { IDs } = await verifyToken(incomingUserData.accessToken);
// const incomingUserData = req.body.userCredential;

const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Compare the UserID to the values in column A of "UserData" sheet then add ClubCode into user's Club Code into column H 
exports.addClubCode = async (req, res, next) =>{
    try {
        console.log(req.body);
        const UserID = req.body.user.uid;
        const ClubCode = req.body.clubCode;
        // get all UIDs
        const userDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: userDataSheetID,
            range: "userData!A2:A",
        });
        // idk why but we need do this
        const userIDList = (userDataSheet).data.values;
        const listLength = userIDList?.length;
        console.log(`${listLength} listLength`);
        console.log(`${userIDList} userIDList`);
        let rowNumber = 0;
        for (let i = 0; i < listLength; i++) {
            if (userIDList[i][0]=== UserID) {
                rowNumber = i + 2;
                break;
            }
        }
        console.log(rowNumber);

        google.sheets({ version: "v4", auth }).spreadsheets.values.update({
            spreadsheetId: userDataSheetID,
            range: `userData!K${rowNumber}:K${rowNumber}`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[ClubCode]]
            },
        });
        return next();
    } catch (error) {
        console.log(error);
    }
};

// Compare the ClubCode to the values in columne L of MainClubData sheet then get the sheetID(ClubData) of the club with the same ClubCode
exports.addUserDataToClub = async (req, res) =>{
    try {
        const UserID = req.body.user.uid;
        const ClubCode = req.body.clubCode;
        // This gets the row number of the clubcode, this rownumber would "identify" the specific club, MainClubdata row#
        const mainClubDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: "clubData!L2:L",
        });
        const clubCodeList = (mainClubDataSheet).data.values;
        const clubCodesLength = clubCodeList?.length;
        console.log(clubCodeList);
        console.log(clubCodesLength);
        let clubDataRowNumber = 0;
        for (let i = 0; i < clubCodesLength; i++) {
            if (clubCodeList[i][0] === ClubCode) {
                clubDataRowNumber = i + 2;
                break;
            }
        }
        console.log(clubDataRowNumber);

        // This uses the row number to get the club's sheetid
        const clubSheetData = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: `clubData!K${clubDataRowNumber}:K${clubDataRowNumber}`,
        });
        let clubSheet = clubSheetData.data.values[0][0];
        console.log(clubSheet);

         // This is same code as above to get user rowNumber, this could be used to get more User Info
        const userDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: userDataSheetID,
            range: "userData!A2:A",
        });
        const userIDList = (userDataSheet).data.values;
        const listLength = userIDList?.length;
        console.log(listLength);
        console.log(userIDList);
        let userRowNumber2 = 0;
        for (let i = 0; i < listLength; i++) {
            if (userIDList[i][0]=== UserID) {
                userRowNumber2 = i + 2;
                break;
            }
        }
        console.log(`${userRowNumber2} userRowNumber2`);

        // This uses the user row number to get the rest of the user data( A:UID, B:FName, C:LName, D:Email, F:OSIS, G:Grade, H:Off.Class)
        const clubData = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
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
        google.sheets({ version: "v4", auth }).spreadsheets.values.update({
          spreadsheetId: clubSheet,
          range: "Information!A2:H2",
          valueInputOption: "USER_ENTERED",
          resource:{
            values: [[firstName, lastName, UID, OSIS, `member`, grade, email, offClass]]
          },
        });

        // This is used to get the row number of the user's data in their specific club
        const clubNameSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: clubSheet,
            range: "Information!C2:C",
        });
        const nameIDList = (clubNameSheet).data.values;
        const nameListLength = nameIDList?.length;
        console.log(`${nameIDList} nameIDList`);
        console.log(`${nameListLength} nameListLength`);
        let specificClubRowNumber = 0;
        for (let i = 0; i < nameListLength; i++) {
            if (nameIDList[i][0]=== UserID) {
                specificClubRowNumber = i + 2;
                break;
            }
        }
        console.log(`${specificClubRowNumber} specificClubRowNumber`);

        // get what clubs user is in
        const userWhatClubs = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: userDataSheetID,
            range: `userData!J${userRowNumber2}:J${userRowNumber2}`,
        });
        // this is needed, these are the console logs and the turn into oject
        const userClubList = (userWhatClubs).data.values;
        console.log(`${userClubList} userWhatClub`);
        const clubObject = JSON.parse(userClubList);
        console.log(`${clubObject} clubObject`);
        // const hellome = JSON.stringify(clubObject);
        // console.log(hellome);

        // this gets the user's club's name
        const clubName = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: `A${clubDataRowNumber}:A${clubDataRowNumber}`,
        });
        let userClubName = clubName.data.values[0]
        console.log(userClubName);

        // this gets the user's club posiiton in that specific club.
        const clubPosition = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: clubSheet,
            range: `E${specificClubRowNumber}:E${specificClubRowNumber}`,
        });
        let userClubPosition = clubPosition.data.values[0]
        console.log(userClubPosition);
        console.log(ClubCode);

        let newPosition = `{"clubCode":"${ClubCode}","position":"${userClubPosition}","clubName":"${userClubName}"}`
        console.log(`${newPosition} newPosition`);

        const defaultClub = `[{"clubStatus":"User have not join any club yet."}]`;

        let clubResponse = `hey`;
        if ( userWhatClubs === defaultClub) {
            clubResponse = `[${newPosition}]`;
            console.log(`${clubResponse} clubResponse`);
        };

        console.log(`${clubResponse} clubResponse`);
        
    } catch (error) {
    console.log(error);     
    }
};


