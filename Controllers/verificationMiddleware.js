const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

exports.loginMiddleware = async (req, res, next) => {
  try {
    //No CSRF protection
    console.log(req.body);
    const userResponse = req.body.response;

    async function verifyToken(token) {
      client.setCredentials({ access_token: token });
      const userinfo = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });
      return userinfo.data;
    }

    //this verfiy user token
    verifyToken(userResponse.access_token)
      .then((userInfo) => {
        console.log(userInfo);
        //set put userInfo into request called req.userInfo
        req.userInfo = userInfo;
      })
      .catch((error) => {
        console.log(error);
      });

    if (!(userInfo === null || userInfo === undefined)) {
      next();
    } else {
      //send back response if there is no userInfo
    }
  } catch (error) {
    console.log(error);
  }
};
