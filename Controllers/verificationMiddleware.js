const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "896694709483-dpdmbclc3o40j3d53ql06bcplgsmut9q.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

exports.loginMiddleware = async (req, res) => {
  try {
    console.log(req.body);

    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      const userid = payload["sub"];
      // If request specified a G Suite domain:
      // const domain = payload['hd'];
    }
    verify().catch(console.error);
  } catch (error) {
    console.log(error);
  }
};
