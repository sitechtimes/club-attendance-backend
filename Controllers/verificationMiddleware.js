const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

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

      if (
        userInfo &&
        (userResponse.hd === "nycstudents.net" ||
          userResponse.hd === "schools.nyc.gov")
      ) {
        const newUserData = {
          userInfo: {
            sub: req.userInfo.sub,
            firstName: req.userInfo.given_name,
            lastName: req.userInfo.family_name,
            email: req.userInfo.email,
            googleDomain: req.userInfo.hd,
            expires_in: req.body.userCredential.expires_in,
          },
        };
        req.body.newUserData = newUserData;

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

exports.studentOrTeacher = async (req, res) => {
  try {
    const userInfo = req.userInfo;
    if (userInfo.hd === "nycstudents.net") {
      console.log("student");
      req.body.newUserData.type = "student";
      const response = req.body.newUserData;
      // req.session.user = response;
      // // save the session before redirection to ensure page
      // // load does not happen before session is saved
      // req.session.save(function (err) {
      //   if (err) return next(err);
      // });
      console.log(response);
      return res.json(response);
    } else if (userInfo.hd === "schools.nyc.gov") {
      console.log("teacher");
      const response = req.body.newUserData;
      // req.session.user = response;
      // // save the session before redirection to ensure page
      // // load does not happen before session is saved
      // req.session.save(function (err) {
      //   if (err) return next(err);
      // });
      return res.json(response);
    }
  } catch (error) {
    console.log(error);
    return res.json(401);
  }
};
