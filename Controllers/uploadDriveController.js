const fs = require('fs');
const getInvoiceFolder = require('./folder');
const drive = require('./service');
const {
    uploadSingleFile,
  } = require("../utility.js");

exports.scanAndUpload = async (req, res, next) => {
    try {
        const scanFolderForFiles = async (folderPath) => {
            const folder = await fs.promises.opendir(folderPath);
            for await (const dirent of folder) {
              if (dirent.isFile() && dirent.name.endsWith('.pdf')) {
                await uploadSingleFile(dirent.name, path.join(folderPath, dirent.name));
                await fs.promises.rm(filePath);
              }
            }
          };
      return next();
    } catch (error) {
      console.log(error);
    }
  };
  
