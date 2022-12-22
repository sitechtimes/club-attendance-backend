const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

exports.verifyemailMiddleware = async (req, res, next) => {
  try {
    //  console.log(req.body);
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
      // console.log(userInfo);
      //set put userInfo into request called req.userInfo

      req.userInfo = userInfo;
      req.userInfo.hd = incomingUserData.hd;

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
