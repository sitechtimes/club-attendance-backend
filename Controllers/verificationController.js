const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

exports.verifyemailMiddleware = async (req, res, next) => {
  try {
    //  console.log(req.body);

    //this is the google crediental that is being sent over
    const incomingUserData = req.body.userCredential;

    //this function verfiy the access token generated from google login
    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    verifyToken(incomingUserData.access_token).then((userInfo) => {
      // console.log(userInfo);
      //set put userInfo into request called req.userInfo

      //this sets the decoded JWT token data to request
      req.userInfo = userInfo;
      //this sets the google domain
      req.userInfo.hd = incomingUserData.hd;

      //restricted to only school email
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
  } catch (error) {
    console.log(error);
  }
};
