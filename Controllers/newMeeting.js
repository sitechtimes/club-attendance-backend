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

exports.newMeeting = async (req, res, next) =>{
    try {
        console.log(req.body);
        const clubName = "Chinese Culture Club";
        const newMeeting = "9/2/2023"

        // This gets the row number of the clubname, this rownumber would "identify" the specific club, MainClubdata row#
        const mainClubDataSheet = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: "clubData!A2:A",
        });
        const clubNameList = (mainClubDataSheet).data.values;
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

        const clubmeeting = await google.sheets({ version: "v4", auth }).spreadsheets.values.get({
            spreadsheetId: MainClubData,
            range: `clubData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
        });
        let meetingList = clubmeeting.data.values[0]

        if(`${meetingList}`.includes(`${newMeeting}`) === true){
            res.json(`Meeting already exist`);
        } else {
            res.json(newMeeting);
        }

        const meetingDefault = `No Meetings`;
        if (`${meetingList}` === `${meetingDefault}`) {
            // This is to change the "user got no club" to a real club. 
            console.log("Step 1")
            meetingResponse = newMeeting;
            google.sheets({ version: "v4", auth }).spreadsheets.values.update({
                spreadsheetId: MainClubData,
                range: `clubData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
                valueInputOption: "USER_ENTERED",                                                                                                    
                resource:{
                  values: [[meetingResponse]]
                },
              });
            console.log(`${meetingResponse} meetingResponse`);
        } else if(`${meetingList}`.includes(`${newMeeting}`) === true){
            // This prevent users from adding the same club twice. 
            console.log("Step 2");
            let meetingResponse = `${meetingList}`
            google.sheets({ version: "v4", auth }).spreadsheets.values.update({
                spreadsheetId: mainClubDataSheet,
                range: `clubData!J${clubDataRowNumber}:J${clubDataRowNumber}`,
                valueInputOption: "USER_ENTERED",
                resource:{
                  values: [[meetingResponse]]
                },
            });
        } else { 
            // This is to add a new club to the list of clubs. 
            const meetingListString = `${meetingList}`
            let meetingResponse = meetingListString.concat(`, ${newPosition}]`)
            console.log(`${meetingResponse} meetingresponse step 3`);
            console.log(meetingResponse.includes(newMeeting));
            google.sheets({ version: "v4", auth }).spreadsheets.values.update({
                spreadsheetId: userDataSheetID,
                range: `userData!I${clubDataRowNumber}:I${clubDataRowNumber}`,
                valueInputOption: "USER_ENTERED",
                resource:{
                  values: [[meetingResponse]]
                },
            });
        }

    } catch (error) {
        console.log(error);
    }
};