var QRCode = require("qrcode");

exports.generateQRCode = async (req, res) => {
  QRCode.toDataURL("I am a pony!", function (err, url) {
    console.log(url);
  });
};
