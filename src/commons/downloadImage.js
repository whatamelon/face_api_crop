const fs = require('fs');
const path = require('path');
const request = require('request');

var download = function(uri, uploadFolder, callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(uploadFolder)).on('close', callback);
    });
};
  
  
var downloadImages = async function (fileList) {
    console.log(fileList)
    const imgCropPromise = fileList.map(async (uri) => {

        const lastIdx = uri.lastIndexOf('/');
        const uploadFolder = path.resolve('./uploads'+uri.substring(lastIdx));

        download(uri, uploadFolder, function(){});
    });

    const promiseResult = await Promise.all(imgCropPromise);

    if (promiseResult) return 200;

    return 404;
}

export { downloadImages }