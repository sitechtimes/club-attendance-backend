const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const { google } = require("googleapis");
const spreadsheetId = "1noJsX0K3kuI4D7b2y6CnNkUyv4c5ZH-IDnfn2hFu_ws";

const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

exports.verifyemailMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const incomingUserData = req.body.userCredential;

    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    // this verfiy user token
    verifyToken(incomingUserData.access_token).then((userInfo) => {
      console.log(userInfo);
      //set put userInfo into request called req.userInfo

      req.userInfo = userInfo;
      req.userInfo.hd = incomingUserData.hd;

      let sheet = google.sheets({ version: "v4", auth: client });
      let values = [[JSON.stringify(req.userInfo)]];
      let resource = {
        values,
      };
      sheet.spreadsheets.values.append(
        {
          auth,
          spreadsheetId,
          range: "Information!A:A",
          resource,
          valueInputOption: "RAW",
        },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(
              "User credentials successfully entered in Google Sheets."
            );
          }
        }
      );

      if (
        userInfo &&
        (incomingUserData.hd === "nycstudents.net" ||
          incomingUserData.hd === "schools.nyc.gov")
      ) {
        return next();
      } else {
        // this else does not work
        console.log("User did not use school email");
        return res.json(
          "You must use a school email: nycstudents.net or schools.nyc.gov)"
        );
      }
    });
    // reminder to resict this to nycstudents domain
  } catch (error) {
    console.log(error);
  }
};
