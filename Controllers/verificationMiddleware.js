const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const { google } = require("googleapis");
const spreadsheetId = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";
 
const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});
 
// Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client });
 
 
exports.loginMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const userResponse = req.body.userCredential;
 
    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }
 
    // this verfiy user token
    verifyToken(userResponse.access_token).then((userInfo) => {
      console.log(userInfo);
      //set put userInfo into request called req.userInfo
 
      req.userInfo = userInfo;
      req.userInfo.hd = userResponse.hd;
 
      let sheet = google.sheets({version: 'v4', auth: client});
      let values = [
        [
         JSON.stringify(req.userInfo.sub),
         JSON.stringify(req.userInfo.name),
         JSON.stringify(req.userInfo.given_name),
         JSON.stringify(req.userInfo.family_name),
         JSON.stringify(req.userInfo.picture),
         JSON.stringify(req.userInfo.email),
         JSON.stringify(req.userInfo.email_verified),
         JSON.stringify(req.userInfo.locale),
         JSON.stringify(req.userInfo.hd),
        ]
      ];
      let resource = {
        values,
      };
      sheet.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Information!A:I',
        resource,
        valueInputOption: 'RAW',
      }, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log('User credentials successfully entered in Google Sheets.');
        }
      });
 
      if (
        userInfo &&
        (userResponse.hd === "nycstudents.net" ||
          userResponse.hd === "schools.nyc.gov")
      ) {
        return next();
      } else {
        // this else does not work
        console.log("something went wrong");
        return res.end(
          "You must use a school email. Ex: nycstudents.net or schools.nyc.gov"
        );
      }
    });
    // reminder to resict this to nycstudents domain
  } catch (error) {
    console.log(error);
  }
};


// exports.studentOrTeacher = async (req, res) => {
//   try {
//     const userInfo = req.userInfo;
//     if (userInfo.hd === "nycstudents.net") {
//       console.log("student");
//       req.newUserData.type = "student";
//       const response = req.newUserData;

//       //add user data to session
//       // req.session.user = response;

//       console.log(response);
//       res.json(response);
//     } else if (userInfo.hd === "schools.nyc.gov") {
//       console.log("teacher");
//       req.newUserData.type = "teacher";
//       const response = req.newUserData;

//       //add user data to session
//       // req.session.user = response;

//       res.json(response);
//     }
//   } catch (error) {
//     console.log(error);
//     res.json(401);
//   }
// };
